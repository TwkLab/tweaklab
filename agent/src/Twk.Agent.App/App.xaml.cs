using System;
using System.IO;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;

namespace Twk.Agent.App;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application
{
    public App()
    {
        LogInfo("App constructor started");
    }

    public static void LogInfo(string message)
    {
        try
        {
            var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TweakLab");
            if (!Directory.Exists(appData))
            {
                Directory.CreateDirectory(appData);
            }

            var logFile = Path.Combine(appData, "agent-log.txt");
            var line = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] [INFO] {message}\n";
            File.AppendAllText(logFile, line);
        }
        catch {}
    }

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        LogInfo("App.OnStartup triggered");

        Exit += (s, args) => LogInfo($"App.Exit fired. ExitCode={args.ApplicationExitCode}");
        AppDomain.CurrentDomain.ProcessExit += (s, args) => LogInfo($"ProcessExit fired.\n{Environment.StackTrace}");

        // 1. Dispatcher Unhandled Exceptions (UI Thread)
        DispatcherUnhandledException += App_DispatcherUnhandledException;

        // 2. AppDomain Unhandled Exceptions (Non-UI Threads)
        AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;

        // 3. Unobserved Task Exceptions (Async / Task Pool)
        TaskScheduler.UnobservedTaskException += TaskScheduler_UnobservedTaskException;
    }

    private void App_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
    {
        LogCrash("DispatcherUnhandledException", e.Exception);
        if (MainWindow == null || !MainWindow.IsVisible)
        {
            MessageBox.Show($"Ocorreu um erro ao inicializar o TweakLab:\n\n{e.Exception.Message}\n\nDetalhes gravados em %APPDATA%\\TweakLab\\agent-log.txt", "TweakLab - Falha na Inicialização", MessageBoxButton.OK, MessageBoxImage.Error);
            Shutdown(1);
        }
        else
        {
            e.Handled = true; // Prevent app termination if window is already up
        }
    }

    private void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
    {
        if (e.ExceptionObject is Exception ex)
        {
            LogCrash("CurrentDomain_UnhandledException", ex);
        }
    }

    private void TaskScheduler_UnobservedTaskException(object? sender, UnobservedTaskExceptionEventArgs e)
    {
        LogCrash("UnobservedTaskException", e.Exception);
        e.SetObserved(); // Mark as handled
    }

    private static void LogCrash(string source, Exception ex)
    {
        try
        {
            var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "TweakLab");
            if (!Directory.Exists(appData))
            {
                Directory.CreateDirectory(appData);
            }

            var logFile = Path.Combine(appData, "agent-log.txt");
            var line = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC] [{source}] {ex.GetType().Name}: {ex.Message}\n{ex.StackTrace}\n\n";
            File.AppendAllText(logFile, line);
        }
        catch {}
    }
}
