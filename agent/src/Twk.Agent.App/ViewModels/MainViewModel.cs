using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Threading;
using Microsoft.Win32;
using Twk.Agent.Core.Interfaces;
using Twk.Agent.Core.Models;
using Twk.Agent.Core.Services;
using Twk.Agent.Infrastructure.Services;
using Twk.Agent.Windows.Collectors;
using Twk.Agent.Windows.Services;

namespace Twk.Agent.App.ViewModels;

public class MainViewModel : INotifyPropertyChanged
{
    private readonly IHardwareCollector _collector;
    private readonly IEvidenceSerializer _serializer;
    private readonly WindowsLiveTelemetryService _telemetryService;
    private readonly CloudSyncService _cloudSyncService;
    private readonly ChatService _chatService;
    private readonly DispatcherTimer _telemetryTimer;
    private readonly DispatcherTimer _chatTimer;
    private CancellationTokenSource? _cts;

    // View Navigation
    private int _selectedTabIndex = 0; // 0 = Telemetria, 1 = Triagem, 2 = Ferramentas, 3 = Conta, 4 = Chat

    // Chat State
    private string _currentChatMessage = "";
    private string _chatTicketCode = "TWK-2026-084";
    private string _chatCustomerName = "Cliente";
    private bool _isChatSending;
    private string _chatStatusMessage = "Canal de atendimento pronto.";
    public Action? OnMessageAdded;

    // State
    private bool _isCollecting;
    private bool _hasConsent;
    private string _statusMessage = "Pronto para análise local. Nenhum dado coletado.";
    private HardwareInventory? _inventory;
    private string? _serializedEvidence;
    private string? _evidenceDigest;
    private EvidenceEnvelope<HardwareInventory>? _currentEnvelope;

    // User Profile & Sync
    private string _userName = "";
    private string _userEmail = "";
    private bool _isLoggedIn;
    private bool _isSyncing;
    private string _syncStatusMessage = "Não sincronizado com a nuvem.";

    // Live Metrics
    private double _cpuUsage;
    private string _cpuTempFormatted = "-- °C";
    private double _ramUsage;
    private string _ramUsageFormatted = "-- GB / -- GB";
    private string _gpuName = "Detectando GPU...";
    private double _diskUsage;
    private string _diskFormatted = "-- GB livres";
    private string _uptimeFormatted = "--";

    // Tool Store Filtering & Search
    private string _searchQuery = "";
    private string _selectedCategory = "Todas";
    private readonly List<TechnicianTool> _allTools;

    public MainViewModel(IHardwareCollector collector, IEvidenceSerializer serializer)
    {
        _collector = collector;
        _serializer = serializer;
        _telemetryService = new WindowsLiveTelemetryService();
        _cloudSyncService = new CloudSyncService();
        _chatService = new ChatService();

        // 1. Load tools and detect installed executables
        var baseTools = TechnicianToolCatalog.GetTools();
        _allTools = ToolDetector.DetectInstalledTools(baseTools);
        FilteredTools = new ObservableCollection<TechnicianTool>(_allTools);

        // 2. Categories
        Categories = new ObservableCollection<string>(new[]
        {
            "Todas",
            "Acesso Remoto",
            "Telemetria & Sensores",
            "Diagnóstico de Hardware",
            "Benchmark & Frametimes",
            "Monitoramento & GPU",
            "Limpeza de Drivers",
            "Estresse & Estabilidade",
            "Armazenamento & Limpeza",
            "Crash Dump & Blue Screen"
        });

        // 3. Setup Commands
        CollectCommand = new RelayCommand(async _ => await StartCollectionAsync(), _ => HasConsent && !IsCollecting);
        CancelCommand = new RelayCommand(_ => CancelCollection(), _ => IsCollecting);
        ExportCommand = new RelayCommand(_ => ExportEvidence(), _ => Inventory != null);
        CopyDigestCommand = new RelayCommand(_ => CopyDigestToClipboard(), _ => !string.IsNullOrEmpty(EvidenceDigest));
        CopySpecsCommand = new RelayCommand(_ => CopySpecsToClipboard(), _ => Inventory != null);
        CopyRamCommand = new RelayCommand(_ => CopyRamToClipboard(), _ => Inventory != null);
        LoginCommand = new RelayCommand(_ => PerformLogin(), _ => !string.IsNullOrWhiteSpace(UserEmail));
        LogoutCommand = new RelayCommand(_ => PerformLogout());
        SyncCloudCommand = new RelayCommand(async _ => await SyncWithCloudAsync(), _ => IsLoggedIn && Inventory != null && !IsSyncing);
        OpenToolCommand = new RelayCommand(toolObj => LaunchOrDownloadTool(toolObj as TechnicianTool));
        OpenToolSiteCommand = new RelayCommand(url => OpenExternalUrl(url?.ToString()));
        OpenPortalCommand = new RelayCommand(_ => OpenExternalUrl("https://tweaklab-lac.vercel.app/portal"));

        // Chat Commands
        SendChatMessageCommand = new RelayCommand(async _ => await SendChatMessageAsync(), _ => !string.IsNullOrWhiteSpace(CurrentChatMessage) && !IsChatSending);
        SendQuickSnippetCommand = new RelayCommand(async s => await SendQuickSnippetAsync(s as string), _ => !IsChatSending);
        SendSpecsToChatCommand = new RelayCommand(async _ => await SendSpecsToChatAsync(), _ => !IsChatSending);
        SendSha256ToChatCommand = new RelayCommand(async _ => await SendSha256ToChatAsync(), _ => !IsChatSending);
        ClearChatCommand = new RelayCommand(_ => ClearChat());
        CopyChatHistoryCommand = new RelayCommand(_ => CopyChatHistory());
        RefreshChatCommand = new RelayCommand(async _ => await PollChatTickAsync());

        // 4. Restore local session
        LoadSavedUser();

        // 5. Setup Live Telemetry Timer (every 1.5s)
        _telemetryTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(1.5)
        };
        _telemetryTimer.Tick += async (s, e) => await UpdateTelemetryTickAsync();
        _telemetryTimer.Start();

        // 6. Setup Live Chat Poll Timer (every 4s)
        _chatTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(4)
        };
        _chatTimer.Tick += async (s, e) => await PollChatTickAsync();
        _chatTimer.Start();

        // Prime first snapshot and chat immediately
        _ = UpdateTelemetryTickAsync();
        _ = ReloadChatForTicketAsync();
    }

    public ObservableCollection<AgentChatMessage> ChatMessages { get; } = new();

    public string CurrentChatMessage
    {
        get => _currentChatMessage;
        set
        {
            if (SetField(ref _currentChatMessage, value))
            {
                CommandManager.InvalidateRequerySuggested();
            }
        }
    }

    public string ChatTicketCode
    {
        get => _chatTicketCode;
        set
        {
            if (SetField(ref _chatTicketCode, value))
            {
                _ = ReloadChatForTicketAsync();
            }
        }
    }

    public string ChatCustomerName
    {
        get => _chatCustomerName;
        set => SetField(ref _chatCustomerName, value);
    }

    public bool IsChatSending
    {
        get => _isChatSending;
        private set
        {
            if (SetField(ref _isChatSending, value))
            {
                CommandManager.InvalidateRequerySuggested();
            }
        }
    }

    public string ChatStatusMessage
    {
        get => _chatStatusMessage;
        private set => SetField(ref _chatStatusMessage, value);
    }

    public ICommand SendChatMessageCommand { get; }
    public ICommand SendQuickSnippetCommand { get; }
    public ICommand SendSpecsToChatCommand { get; }
    public ICommand SendSha256ToChatCommand { get; }
    public ICommand ClearChatCommand { get; }
    public ICommand CopyChatHistoryCommand { get; }
    public ICommand RefreshChatCommand { get; }

    public ObservableCollection<TechnicianTool> FilteredTools { get; }
    public ObservableCollection<string> Categories { get; }

    public int SelectedTabIndex
    {
        get => _selectedTabIndex;
        set => SetField(ref _selectedTabIndex, value);
    }

    public string SearchQuery
    {
        get => _searchQuery;
        set
        {
            if (SetField(ref _searchQuery, value))
            {
                ApplyToolFilter();
            }
        }
    }

    public string SelectedCategory
    {
        get => _selectedCategory;
        set
        {
            if (SetField(ref _selectedCategory, value))
            {
                ApplyToolFilter();
            }
        }
    }

    private void ApplyToolFilter()
    {
        var query = (SearchQuery ?? "").Trim().ToLowerInvariant();
        var cat = SelectedCategory ?? "Todas";

        var filtered = _allTools.Where(t =>
        {
            bool matchesCat = cat == "Todas" || t.Category.Equals(cat, StringComparison.OrdinalIgnoreCase);
            if (!matchesCat) return false;

            if (string.IsNullOrEmpty(query)) return true;

            return t.Name.ToLowerInvariant().Contains(query) ||
                   t.Description.ToLowerInvariant().Contains(query) ||
                   t.RecommendedUse.ToLowerInvariant().Contains(query) ||
                   t.Category.ToLowerInvariant().Contains(query);
        }).ToList();

        FilteredTools.Clear();
        foreach (var tool in filtered)
        {
            FilteredTools.Add(tool);
        }
    }

    public bool HasConsent
    {
        get => _hasConsent;
        set
        {
            if (SetField(ref _hasConsent, value))
            {
                OnPropertyChanged(nameof(CanCollect));
                CommandManager.InvalidateRequerySuggested();
            }
        }
    }

    public bool IsCollecting
    {
        get => _isCollecting;
        private set
        {
            if (SetField(ref _isCollecting, value))
            {
                OnPropertyChanged(nameof(CanCollect));
                CommandManager.InvalidateRequerySuggested();
            }
        }
    }

    public bool CanCollect => HasConsent && !IsCollecting;

    public string StatusMessage
    {
        get => _statusMessage;
        private set => SetField(ref _statusMessage, value);
    }

    public HardwareInventory? Inventory
    {
        get => _inventory;
        private set
        {
            if (SetField(ref _inventory, value))
            {
                OnPropertyChanged(nameof(HasHardwareData));
                CommandManager.InvalidateRequerySuggested();
            }
        }
    }

    public bool HasHardwareData => Inventory != null;

    public string? SerializedEvidence
    {
        get => _serializedEvidence;
        private set => SetField(ref _serializedEvidence, value);
    }

    public string? EvidenceDigest
    {
        get => _evidenceDigest;
        private set => SetField(ref _evidenceDigest, value);
    }

    // User Session
    public string UserName
    {
        get => _userName;
        set => SetField(ref _userName, value);
    }

    public string UserEmail
    {
        get => _userEmail;
        set => SetField(ref _userEmail, value);
    }

    public bool IsLoggedIn
    {
        get => _isLoggedIn;
        private set
        {
            if (SetField(ref _isLoggedIn, value))
            {
                CommandManager.InvalidateRequerySuggested();
            }
        }
    }

    public bool IsSyncing
    {
        get => _isSyncing;
        private set => SetField(ref _isSyncing, value);
    }

    public string SyncStatusMessage
    {
        get => _syncStatusMessage;
        private set => SetField(ref _syncStatusMessage, value);
    }

    // Live Metrics
    public double CpuUsage
    {
        get => _cpuUsage;
        private set => SetField(ref _cpuUsage, value);
    }

    public string CpuTempFormatted
    {
        get => _cpuTempFormatted;
        private set => SetField(ref _cpuTempFormatted, value);
    }

    public double RamUsage
    {
        get => _ramUsage;
        private set => SetField(ref _ramUsage, value);
    }

    public string RamUsageFormatted
    {
        get => _ramUsageFormatted;
        private set => SetField(ref _ramUsageFormatted, value);
    }

    public string GpuName
    {
        get => _gpuName;
        private set => SetField(ref _gpuName, value);
    }

    public double DiskUsage
    {
        get => _diskUsage;
        private set => SetField(ref _diskUsage, value);
    }

    public string DiskFormatted
    {
        get => _diskFormatted;
        private set => SetField(ref _diskFormatted, value);
    }

    public string UptimeFormatted
    {
        get => _uptimeFormatted;
        private set => SetField(ref _uptimeFormatted, value);
    }

    // Commands
    public ICommand CollectCommand { get; }
    public ICommand CancelCommand { get; }
    public ICommand ExportCommand { get; }
    public ICommand CopyDigestCommand { get; }
    public ICommand CopySpecsCommand { get; }
    public ICommand CopyRamCommand { get; }
    public ICommand LoginCommand { get; }
    public ICommand LogoutCommand { get; }
    public ICommand SyncCloudCommand { get; }
    public ICommand OpenToolCommand { get; }
    public ICommand OpenToolSiteCommand { get; }
    public ICommand OpenPortalCommand { get; }

    private void PerformLogin()
    {
        if (string.IsNullOrWhiteSpace(UserEmail)) return;
        IsLoggedIn = true;
        SaveUserLocal();
        SyncStatusMessage = $"Autenticado como {UserEmail}. Pronto para sincronizar.";

        if (Inventory != null)
        {
            _ = SyncWithCloudAsync();
        }
    }

    private void PerformLogout()
    {
        IsLoggedIn = false;
        UserName = "";
        UserEmail = "";
        SyncStatusMessage = "Sessão encerrada.";
        try
        {
            var path = GetUserDataFilePath();
            if (File.Exists(path)) File.Delete(path);
        }
        catch {}
    }

    public async Task SyncWithCloudAsync()
    {
        if (string.IsNullOrWhiteSpace(UserEmail) || string.IsNullOrEmpty(SerializedEvidence))
        {
            SyncStatusMessage = "Faça login e colete uma evidência antes de sincronizar.";
            return;
        }

        IsSyncing = true;
        SyncStatusMessage = "Transmitindo evidência criptografada para tweaklab.com...";

        try
        {
            var res = await _cloudSyncService.SyncEvidenceAsync(UserEmail, _currentEnvelope ?? (object)SerializedEvidence);
            if (res.Success)
            {
                SyncStatusMessage = $"✓ {res.Message}";
            }
            else
            {
                SyncStatusMessage = $"Aviso ao sincronizar: {res.Message}";
            }
        }
        catch (Exception ex)
        {
            SyncStatusMessage = $"Erro de rede na sincronização: {ex.Message}";
        }
        finally
        {
            IsSyncing = false;
        }
    }

    private async Task UpdateTelemetryTickAsync()
    {
        try
        {
            var snapshot = await Task.Run(() => _telemetryService.GetSnapshotAsync());

            CpuUsage = snapshot.CpuUsagePercent;
            CpuTempFormatted = snapshot.CpuTemperatureC.HasValue ? $"{snapshot.CpuTemperatureC.Value:F1} °C" : "ACPI Normal";
            RamUsage = snapshot.RamUsagePercent;
            RamUsageFormatted = $"{snapshot.RamUsedGb:F1} GB / {snapshot.RamTotalGb:F1} GB ({snapshot.RamUsagePercent:F0}%)";

            if (!string.IsNullOrEmpty(snapshot.GpuName))
            {
                GpuName = snapshot.GpuName;
            }

            if (snapshot.DiskUsagePercent.HasValue)
            {
                DiskUsage = snapshot.DiskUsagePercent.Value;
            }
            if (!string.IsNullOrEmpty(snapshot.DiskFormatted))
            {
                DiskFormatted = snapshot.DiskFormatted;
            }
            if (!string.IsNullOrEmpty(snapshot.UptimeFormatted))
            {
                UptimeFormatted = snapshot.UptimeFormatted;
            }
        }
        catch
        {
            // Fail silently on telemetry tick to never disrupt the user
        }
    }

    public async Task StartCollectionAsync()
    {
        if (!HasConsent)
        {
            StatusMessage = "Consentimento obrigatório para realizar a triagem.";
            return;
        }

        IsCollecting = true;
        StatusMessage = "Iniciando varredura auditável de hardware via WMI...";
        _cts = new CancellationTokenSource();

        try
        {
            StatusMessage = "Lendo informações da CPU, BIOS e Placa-mãe...";
            var inv = await Task.Run(() => _collector.CollectAsync(_cts.Token), _cts.Token);
            Inventory = inv;

            StatusMessage = "Calculando assinatura de integridade SHA-256...";
            var consentRecord = new ConsentReceipt(
                NoticeVersion: "1.0",
                Categories: new[] { "cpu", "ram", "gpu", "storage", "os", "motherboard" },
                ConfirmedAtUtc: DateTime.UtcNow,
                PayloadDigest: ""
            );

            var envelope = new EvidenceEnvelope<HardwareInventory>(
                SchemaVersion: 1,
                ClientEvidenceId: Guid.NewGuid(),
                AgentVersion: "1.0.0-hub",
                LinkId: null,
                CapturedAtUtc: DateTime.UtcNow,
                Kind: "hardware_inventory",
                Consent: consentRecord,
                Payload: inv
            );

            var initialJson = _serializer.SerializeSanitized(envelope);
            var computedDigest = _serializer.ComputeDigest(initialJson);

            var sealedEnvelope = envelope with
            {
                Consent = consentRecord with { PayloadDigest = computedDigest }
            };

            _currentEnvelope = sealedEnvelope;
            SerializedEvidence = _serializer.SerializeSanitized(sealedEnvelope);
            EvidenceDigest = computedDigest;

            StatusMessage = $"✓ Triagem concluída com sucesso! Assinatura: {computedDigest[..18]}...";

            // Auto-sync if user is logged in
            if (IsLoggedIn && !string.IsNullOrWhiteSpace(UserEmail))
            {
                _ = SyncWithCloudAsync();
            }
        }
        catch (OperationCanceledException)
        {
            StatusMessage = "Coleta cancelada pelo usuário.";
        }
        catch (Exception ex)
        {
            StatusMessage = $"Erro durante a coleta: {ex.Message}";
        }
        finally
        {
            IsCollecting = false;
            _cts?.Dispose();
            _cts = null;
        }
    }

    public void CancelCollection()
    {
        _cts?.Cancel();
    }

    private void CopyDigestToClipboard()
    {
        if (string.IsNullOrEmpty(EvidenceDigest)) return;
        try
        {
            Clipboard.SetText(EvidenceDigest);
            StatusMessage = "✓ Selo SHA-256 copiado para a Área de Transferência!";
        }
        catch {}
    }

    private void CopyRamToClipboard()
    {
        if (Inventory?.Ram == null) return;
        try
        {
            var model = !string.IsNullOrEmpty(Inventory.Ram.CommercialSummary)
                ? Inventory.Ram.CommercialSummary
                : Inventory.Ram.TotalFormatted;

            var sb = new System.Text.StringBuilder();
            sb.AppendLine($"Modelo da Memória RAM: {model}");
            foreach (var m in Inventory.Ram.Modules)
            {
                var mModel = !string.IsNullOrEmpty(m.CommercialModel) ? m.CommercialModel : m.Manufacturer;
                sb.AppendLine($"• {m.BankLabel}: {mModel} — {m.CapacityFormatted} @ {m.Speed} (Part Number: {m.PartNumber})");
            }

            Clipboard.SetText(sb.ToString().TrimEnd());
            StatusMessage = "✓ Modelo exato da memória RAM copiado!";
        }
        catch {}
    }

    private void CopySpecsToClipboard()
    {
        if (Inventory == null) return;
        try
        {
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("=== TWEAKLAB — LAUDO TÉCNICO & ESPECIFICAÇÕES DO COMPUTADOR ===");
            sb.AppendLine($"Data da Auditoria: {DateTime.Now:dd/MM/yyyy HH:mm:ss}");
            if (!string.IsNullOrEmpty(EvidenceDigest))
            {
                sb.AppendLine($"Selo de Integridade (SHA-256): {EvidenceDigest}");
            }
            sb.AppendLine();
            sb.AppendLine($"• Processador (CPU): {Inventory.Cpu.Model} ({Inventory.Cpu.PhysicalCores} Cores / {Inventory.Cpu.LogicalProcessors} Threads • {Inventory.Cpu.Architecture})");

            var ramTitle = !string.IsNullOrEmpty(Inventory.Ram.CommercialSummary)
                ? Inventory.Ram.CommercialSummary
                : Inventory.Ram.TotalFormatted;
            sb.AppendLine($"• Memória RAM: {ramTitle}");
            foreach (var m in Inventory.Ram.Modules)
            {
                var mModel = !string.IsNullOrEmpty(m.CommercialModel) ? m.CommercialModel : m.Manufacturer;
                sb.AppendLine($"    - {m.BankLabel}: {mModel} — {m.CapacityFormatted} @ {m.Speed} (Part: {m.PartNumber})");
            }

            sb.AppendLine("• Placa de Vídeo (GPU):");
            foreach (var g in Inventory.Gpus)
            {
                sb.AppendLine($"    - {g.Model} (VRAM: {g.DedicatedVramFormatted}, Driver: {g.DriverVersion})");
            }

            sb.AppendLine($"• Placa-Mãe: {Inventory.Motherboard.Manufacturer} {Inventory.Motherboard.Model} (BIOS: {Inventory.Motherboard.BiosVersion})");
            sb.AppendLine($"• Sistema Operacional: {Inventory.OperatingSystem.Caption} (Build {Inventory.OperatingSystem.BuildNumber} • {Inventory.OperatingSystem.Architecture})");
            sb.AppendLine();
            sb.AppendLine("Laudo auditado pelo TweakLab Agent (https://tweaklab.com)");

            Clipboard.SetText(sb.ToString());
            StatusMessage = "✓ Especificações completas copiadas (com modelo exato da RAM)!";
        }
        catch {}
    }

    private void LaunchOrDownloadTool(TechnicianTool? tool)
    {
        if (tool == null) return;

        if (tool.IsInstalled && !string.IsNullOrEmpty(tool.ExecutablePath) && File.Exists(tool.ExecutablePath))
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = tool.ExecutablePath,
                    UseShellExecute = true
                });
                StatusMessage = $"Iniciando {tool.Name}...";
                return;
            }
            catch {}
        }

        // Otherwise open download link
        OpenExternalUrl(tool.DownloadUrl);
    }

    private void ExportEvidence()
    {
        if (string.IsNullOrEmpty(SerializedEvidence)) return;

        var sfd = new SaveFileDialog
        {
            Filter = "Envelope de Evidência JSON (*.json)|*.json",
            FileName = $"twk-evidence-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json",
            Title = "Exportar Envelope de Evidência TweakLab"
        };

        if (sfd.ShowDialog() == true)
        {
            try
            {
                File.WriteAllText(sfd.FileName, SerializedEvidence);
                StatusMessage = $"Evidência exportada em: {Path.GetFileName(sfd.FileName)}";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Erro ao salvar o arquivo: {ex.Message}";
            }
        }
    }

    private static void OpenExternalUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return;
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            });
        }
        catch {}
    }

    private void SaveUserLocal()
    {
        try
        {
            var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TweakLab");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            var file = Path.Combine(dir, "user.txt");
            File.WriteAllLines(file, new[] { UserName, UserEmail });
        }
        catch {}
    }

    private void LoadSavedUser()
    {
        try
        {
            var path = GetUserDataFilePath();
            if (File.Exists(path))
            {
                var lines = File.ReadAllLines(path);
                if (lines.Length >= 2)
                {
                    UserName = lines[0];
                    UserEmail = lines[1];
                    if (!string.IsNullOrWhiteSpace(UserEmail))
                    {
                        IsLoggedIn = true;
                        SyncStatusMessage = $"Conectado com {UserEmail}";
                        if (lines.Length >= 3 && !string.IsNullOrWhiteSpace(lines[2]))
                        {
                            ChatTicketCode = lines[2].Trim();
                        }
                        else
                        {
                            ChatTicketCode = UserEmail.Contains("@") ? UserEmail.Split('@')[0].ToUpperInvariant() : "TWK-2026-084";
                        }
                    }
                }
            }
        }
        catch {}
    }

    #region Chat Methods

    public async Task SendSpecsToChatAsync()
    {
        if (Inventory == null)
        {
            await SendChatMessageAsync("⚠️ Nenhum hardware coletado ainda. Clique em 'Iniciar Diagnóstico' na aba 'Diagnóstico do PC' para auditar esta máquina.");
            return;
        }

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("🖥️ LAUDO DE HARDWARE & ESPECIFICAÇÕES DO PC");
        sb.AppendLine($"• Processador (CPU): {Inventory.Cpu.Model} ({Inventory.Cpu.PhysicalCores} Cores / {Inventory.Cpu.LogicalProcessors} Threads • {Inventory.Cpu.Architecture})");

        var ramTitle = !string.IsNullOrEmpty(Inventory.Ram.CommercialSummary)
            ? Inventory.Ram.CommercialSummary
            : Inventory.Ram.TotalFormatted;
        sb.AppendLine($"• Memória RAM: {ramTitle}");
        foreach (var m in Inventory.Ram.Modules)
        {
            var mModel = !string.IsNullOrEmpty(m.CommercialModel) ? m.CommercialModel : m.Manufacturer;
            sb.AppendLine($"    - {m.BankLabel}: {mModel} ({m.CapacityFormatted} @ {m.Speed})");
        }

        if (Inventory.Gpus.Count > 0)
        {
            sb.AppendLine($"• Placa de Vídeo (GPU): {Inventory.Gpus[0].Model} ({Inventory.Gpus[0].DedicatedVramFormatted}, Driver {Inventory.Gpus[0].DriverVersion})");
        }

        sb.AppendLine($"• Placa-Mãe: {Inventory.Motherboard.Manufacturer} {Inventory.Motherboard.Model} (BIOS {Inventory.Motherboard.BiosVersion})");
        sb.AppendLine($"• Sistema: {Inventory.OperatingSystem.Caption} (Build {Inventory.OperatingSystem.BuildNumber})");
        if (!string.IsNullOrEmpty(EvidenceDigest))
        {
            sb.AppendLine($"• Selo SHA-256: {EvidenceDigest}");
        }
        sb.Append("✓ Hardware auditado e verificado via TweakLab Agent.");

        await SendChatMessageAsync(sb.ToString());
    }

    public async Task SendSha256ToChatAsync()
    {
        if (string.IsNullOrEmpty(EvidenceDigest))
        {
            await SendChatMessageAsync("⚠️ Selo de integridade não disponível. Realize a auditoria na aba 'Diagnóstico do PC' primeiro.");
            return;
        }

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("🛡️ SELO DE INTEGRIDADE & AUDITORIA TWEAKLAB (SHA-256)");
        sb.AppendLine($"• Hash Criptográfico: {EvidenceDigest}");
        sb.AppendLine("• Status: Laudo técnico assinado e protegido contra adulterações.");
        sb.Append("• Validação: O cliente pode conferir este selo no portal web TweakLab.");

        await SendChatMessageAsync(sb.ToString());
    }

    public async Task SendQuickSnippetAsync(string? snippet)
    {
        if (string.IsNullOrWhiteSpace(snippet)) return;
        await SendChatMessageAsync(snippet);
    }

    public async Task SendChatMessageAsync(string? explicitContent = null)
    {
        var text = explicitContent ?? CurrentChatMessage;
        if (string.IsNullOrWhiteSpace(text)) return;

        IsChatSending = true;
        try
        {
            var senderName = !string.IsNullOrWhiteSpace(UserName) ? UserName : "Técnico TWK";
            var (success, msg, err) = await _chatService.SendMessageAsync(
                ChatTicketCode,
                senderName,
                "tecnico",
                text,
                UserEmail);

            if (success)
            {
                if (explicitContent == null)
                {
                    CurrentChatMessage = "";
                }

                if (!ChatMessages.Any(m => m.Id == msg.Id))
                {
                    ChatMessages.Add(msg);
                }
                ChatStatusMessage = $"Mensagem enviada às {DateTime.Now:HH:mm:ss}";
                OnMessageAdded?.Invoke();
            }
            else
            {
                ChatStatusMessage = $"Erro no envio: {err}";
            }
        }
        catch (Exception ex)
        {
            ChatStatusMessage = $"Falha no envio: {ex.Message}";
        }
        finally
        {
            IsChatSending = false;
        }
    }

    public async Task ReloadChatForTicketAsync()
    {
        try
        {
            ChatStatusMessage = "Carregando histórico do chat...";
            var list = await _chatService.LoadMessagesAsync(ChatTicketCode, UserEmail);

            ChatMessages.Clear();
            foreach (var m in list)
            {
                ChatMessages.Add(m);
            }

            ChatStatusMessage = $"{ChatMessages.Count} mensagens sincronizadas.";
            OnMessageAdded?.Invoke();
        }
        catch (Exception ex)
        {
            ChatStatusMessage = $"Erro ao carregar chat: {ex.Message}";
        }
    }

    public async Task PollChatTickAsync()
    {
        try
        {
            var remote = await _chatService.FetchRemoteMessagesAsync(ChatTicketCode, UserEmail);
            if (remote != null && remote.Count > 0)
            {
                bool hasNew = false;
                foreach (var r in remote)
                {
                    if (!ChatMessages.Any(m => m.Id == r.Id || (m.SenderRole == r.SenderRole && m.Content == r.Content && Math.Abs((m.SentAt - r.SentAt).TotalSeconds) < 3)))
                    {
                        ChatMessages.Add(r);
                        hasNew = true;
                    }
                }
                if (hasNew)
                {
                    ChatStatusMessage = $"Novas mensagens recebidas ({DateTime.Now:HH:mm:ss})";
                    OnMessageAdded?.Invoke();
                }
            }
        }
        catch {}
    }

    public void CopyChatHistory()
    {
        if (ChatMessages.Count == 0) return;

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("=== HISTÓRICO DE ATENDIMENTO TWEAKLAB ===");
        sb.AppendLine($"Chamado / Sessão: {ChatTicketCode} | Exportado em: {DateTime.Now:dd/MM/yyyy HH:mm:ss}");
        sb.AppendLine("---------------------------------------------------");
        foreach (var msg in ChatMessages)
        {
            var roleTag = msg.IsSystem ? "[SISTEMA]" : (msg.IsFromTechnician ? "[TÉCNICO]" : "[CLIENTE]");
            sb.AppendLine($"[{msg.FormattedTime}] {roleTag} {msg.SenderName}:");
            sb.AppendLine($"  {msg.Content}");
            sb.AppendLine();
        }
        sb.AppendLine("---------------------------------------------------");

        Clipboard.SetText(sb.ToString());
        ChatStatusMessage = "Histórico copiado para a Área de Transferência!";
    }

    public void ClearChat()
    {
        var res = MessageBox.Show(
            "Deseja realmente limpar a visualização deste chat localmente?",
            "Limpar Chat TweakLab",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question);

        if (res == MessageBoxResult.Yes)
        {
            ChatMessages.Clear();
            ChatStatusMessage = "Histórico do chat limpo.";
        }
    }

    #endregion

    private static string GetUserDataFilePath()
    {
        return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TweakLab", "user.txt");
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    protected bool SetField<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
    {
        if (Equals(field, value)) return false;
        field = value;
        OnPropertyChanged(propertyName);
        return true;
    }
}

public class RelayCommand : ICommand
{
    private readonly Action<object?> _execute;
    private readonly Predicate<object?>? _canExecute;

    public RelayCommand(Action<object?> execute, Predicate<object?>? canExecute = null)
    {
        _execute = execute ?? throw new ArgumentNullException(nameof(execute));
        _canExecute = canExecute;
    }

    public bool CanExecute(object? parameter) => _canExecute?.Invoke(parameter) ?? true;

    public void Execute(object? parameter) => _execute(parameter);

    public event EventHandler? CanExecuteChanged
    {
        add => CommandManager.RequerySuggested += value;
        remove => CommandManager.RequerySuggested -= value;
    }
}
