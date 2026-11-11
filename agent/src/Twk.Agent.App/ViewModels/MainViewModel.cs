using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
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

namespace Twk.Agent.App.ViewModels;

public class MainViewModel : INotifyPropertyChanged
{
    private readonly IHardwareCollector _collector;
    private readonly IEvidenceSerializer _serializer;
    private readonly WindowsLiveTelemetryService _telemetryService;
    private readonly CloudSyncService _cloudSyncService;
    private readonly DispatcherTimer _telemetryTimer;
    private CancellationTokenSource? _cts;

    // View Navigation
    private int _selectedTabIndex = 0; // 0 = Visao Geral & Hardware, 1 = Monitoramento em Tempo Real, 2 = Loja de Ferramentas / Tecnico, 3 = Minha Conta & Sync

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
    private string _gpuName = "Detectando...";
    private string _gpuTempFormatted = "-- °C";

    public MainViewModel(IHardwareCollector collector, IEvidenceSerializer serializer)
    {
        _collector = collector;
        _serializer = serializer;
        _telemetryService = new WindowsLiveTelemetryService();
        _cloudSyncService = new CloudSyncService();

        Tools = new ObservableCollection<TechnicianTool>(TechnicianToolCatalog.GetTools());

        // Setup Commands
        CollectCommand = new RelayCommand(async _ => await StartCollectionAsync(), _ => HasConsent && !IsCollecting);
        CancelCommand = new RelayCommand(_ => CancelCollection(), _ => IsCollecting);
        ExportCommand = new RelayCommand(_ => ExportEvidence(), _ => Inventory != null);
        LoginCommand = new RelayCommand(_ => PerformLogin(), _ => !string.IsNullOrWhiteSpace(UserEmail));
        LogoutCommand = new RelayCommand(_ => PerformLogout());
        SyncCloudCommand = new RelayCommand(async _ => await SyncWithCloudAsync(), _ => IsLoggedIn && Inventory != null && !IsSyncing);
        OpenToolUrlCommand = new RelayCommand(url => OpenExternalUrl(url?.ToString()));

        // Check local saved user
        LoadSavedUser();

        // Setup Live Telemetry Timer (every 1.5s)
        _telemetryTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(1.5)
        };
        _telemetryTimer.Tick += async (s, e) => await UpdateTelemetryTickAsync();
        _telemetryTimer.Start();
    }

    public ObservableCollection<TechnicianTool> Tools { get; }

    public int SelectedTabIndex
    {
        get => _selectedTabIndex;
        set => SetField(ref _selectedTabIndex, value);
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
        private set
        {
            if (SetField(ref _isSyncing, value))
            {
                CommandManager.InvalidateRequerySuggested();
            }
        }
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

    public string GpuTempFormatted
    {
        get => _gpuTempFormatted;
        private set => SetField(ref _gpuTempFormatted, value);
    }

    // Commands
    public ICommand CollectCommand { get; }
    public ICommand CancelCommand { get; }
    public ICommand ExportCommand { get; }
    public ICommand LoginCommand { get; }
    public ICommand LogoutCommand { get; }
    public ICommand SyncCloudCommand { get; }
    public ICommand OpenToolUrlCommand { get; }

    private void PerformLogin()
    {
        if (string.IsNullOrWhiteSpace(UserEmail)) return;
        IsLoggedIn = true;
        SyncStatusMessage = "Conectado. Pronto para sincronizar suas evidências com a nuvem TweakLab.";
        SaveUserLocal();
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

    private async Task SyncWithCloudAsync()
    {
        if (!IsLoggedIn || _currentEnvelope == null) return;

        IsSyncing = true;
        SyncStatusMessage = "Enviando evidências para o portal TweakLab...";

        try
        {
            var res = await _cloudSyncService.SyncEvidenceAsync(UserEmail, _currentEnvelope);
            SyncStatusMessage = res.Message;
        }
        catch (Exception ex)
        {
            SyncStatusMessage = $"Falha no envio: {ex.Message}";
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
            var snapshot = await _telemetryService.GetSnapshotAsync();
            CpuUsage = snapshot.CpuUsagePercent;
            CpuTempFormatted = snapshot.CpuTemperatureC.HasValue ? $"{snapshot.CpuTemperatureC.Value:F1} °C" : "Normal (WMI ACPI N/D)";
            RamUsage = snapshot.RamUsagePercent;
            RamUsageFormatted = $"{snapshot.RamUsedGb:F1} GB / {snapshot.RamTotalGb:F1} GB ({snapshot.RamUsagePercent:F0}%)";
            if (!string.IsNullOrEmpty(snapshot.GpuName))
            {
                GpuName = snapshot.GpuName;
            }
            GpuTempFormatted = "Monitor via HWiNFO64";
        }
        catch
        {
            // silent ignore
        }
    }

    public async Task StartCollectionAsync()
    {
        if (!HasConsent || IsCollecting) return;

        IsCollecting = true;
        StatusMessage = "Lendo WMI e barramentos do sistema...";
        _cts = new CancellationTokenSource();

        try
        {
            var inventory = await _collector.CollectAsync(_cts.Token);
            Inventory = inventory;

            var consentRecord = new ConsentReceipt(
                NoticeVersion: "1.0",
                Categories: new[] { "hardware_inventory", "os_version", "disk_health" },
                ConfirmedAtUtc: DateTime.UtcNow,
                PayloadDigest: "calc-pending"
            );

            var envelope = new EvidenceEnvelope<HardwareInventory>(
                SchemaVersion: 1,
                ClientEvidenceId: Guid.NewGuid(),
                AgentVersion: "0.2.0",
                LinkId: null,
                CapturedAtUtc: DateTime.UtcNow,
                Kind: "hardware_inventory",
                Consent: consentRecord,
                Payload: inventory
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

            StatusMessage = $"Triagem concluída com sucesso! Digest: {computedDigest[..18]}...";

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
                StatusMessage = $"Evidência exportada com sucesso em: {Path.GetFileName(sfd.FileName)}";
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
        catch (Exception ex)
        {
            MessageBox.Show($"Não foi possível abrir o link: {ex.Message}", "TweakLab", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
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
                        SyncStatusMessage = "Conectado automaticamente com a conta salva.";
                    }
                }
            }
        }
        catch {}
    }

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
