using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Win32;
using Twk.Agent.Core.Interfaces;
using Twk.Agent.Core.Models;

namespace Twk.Agent.App.ViewModels;

public class MainViewModel : INotifyPropertyChanged
{
    private readonly IHardwareCollector _collector;
    private readonly IEvidenceSerializer _serializer;
    private CancellationTokenSource? _cts;

    private bool _isCollecting;
    private bool _hasConsent;
    private string _statusMessage = "Pronto para análise local. Nenhum dado coletado.";
    private HardwareInventory? _inventory;
    private string? _serializedEvidence;
    private string? _evidenceDigest;

    public MainViewModel(IHardwareCollector collector, IEvidenceSerializer serializer)
    {
        _collector = collector;
        _serializer = serializer;

        CollectCommand = new RelayCommand(async _ => await StartCollectionAsync(), _ => HasConsent && !IsCollecting);
        CancelCommand = new RelayCommand(_ => CancelCollection(), _ => IsCollecting);
        ExportCommand = new RelayCommand(_ => ExportEvidence(), _ => Inventory != null);
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
        set
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
        set => SetField(ref _statusMessage, value);
    }

    public HardwareInventory? Inventory
    {
        get => _inventory;
        set
        {
            if (SetField(ref _inventory, value))
            {
                OnPropertyChanged(nameof(HasInventory));
                CommandManager.InvalidateRequerySuggested();
            }
        }
    }

    public bool HasInventory => Inventory != null;

    public string? SerializedEvidence
    {
        get => _serializedEvidence;
        set => SetField(ref _serializedEvidence, value);
    }

    public string? EvidenceDigest
    {
        get => _evidenceDigest;
        set => SetField(ref _evidenceDigest, value);
    }

    public ICommand CollectCommand { get; }
    public ICommand CancelCommand { get; }
    public ICommand ExportCommand { get; }

    private async Task StartCollectionAsync()
    {
        if (!HasConsent) return;

        IsCollecting = true;
        StatusMessage = "Coletando inventário local seguro via WMI/CIM...";
        _cts = new CancellationTokenSource();

        try
        {
            var result = await _collector.CollectAsync(_cts.Token);
            Inventory = result;

            var consent = new ConsentReceipt(
                NoticeVersion: "1.0-local-beta",
                Categories: new[] { "cpu", "ram", "gpu", "disks", "motherboard", "os" },
                ConfirmedAtUtc: DateTime.UtcNow,
                PayloadDigest: ""
            );

            var tempEnvelope = new EvidenceEnvelope<HardwareInventory>(
                SchemaVersion: 1,
                ClientEvidenceId: Guid.NewGuid(),
                AgentVersion: "0.1.0-beta",
                LinkId: null,
                CapturedAtUtc: result.CapturedAtUtc,
                Kind: "inventory",
                Consent: consent,
                Payload: result
            );

            var rawJson = _serializer.SerializeSanitized(tempEnvelope);
            var digest = _serializer.ComputeDigest(rawJson);

            // Re-envelope with verified digest
            var finalConsent = consent with { PayloadDigest = digest };
            var finalEnvelope = tempEnvelope with { Consent = finalConsent };

            SerializedEvidence = _serializer.SerializeSanitized(finalEnvelope);
            EvidenceDigest = digest;

            StatusMessage = $"✓ Inventário coletado com sucesso às {result.CapturedAtUtc.ToLocalTime():HH:mm:ss}. Integridade SHA-256 gerada.";
        }
        catch (OperationCanceledException)
        {
            StatusMessage = "Coleta cancelada pelo usuário. Nenhum dado retido.";
        }
        catch (Exception ex)
        {
            StatusMessage = $"Falha na coleta de inventário: {ex.Message}";
        }
        finally
        {
            IsCollecting = false;
            _cts?.Dispose();
            _cts = null;
        }
    }

    private void CancelCollection()
    {
        _cts?.Cancel();
    }

    private void ExportEvidence()
    {
        if (string.IsNullOrEmpty(SerializedEvidence)) return;

        var sfd = new SaveFileDialog
        {
            Filter = "Arquivo JSON de Evidência (*.json)|*.json",
            FileName = $"twk-evidencia-inventario-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json",
            Title = "Exportar Evidência Técnica Auditável"
        };

        if (sfd.ShowDialog() == true)
        {
            try
            {
                File.WriteAllText(sfd.FileName, SerializedEvidence);
                MessageBox.Show($"Evidência exportada com sucesso!\n\nArquivo: {sfd.FileName}\nDigest SHA-256: {EvidenceDigest}",
                    "TweakLab Agent", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao salvar arquivo: {ex.Message}", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
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
