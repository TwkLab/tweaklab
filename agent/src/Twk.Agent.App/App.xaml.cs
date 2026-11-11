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
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

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
        e.Handled = true; // Prevent app termination
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
