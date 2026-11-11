using System.Windows;
using System.Windows.Controls;
using Twk.Agent.App.ViewModels;
using Twk.Agent.Infrastructure.Serialization;
using Twk.Agent.Windows.Collectors;

namespace Twk.Agent.App;

public partial class MainWindow : Window
{
    private readonly Grid[] _pages;

    public MainWindow()
    {
        App.LogInfo("MainWindow constructor starting...");
        try
        {
            InitializeComponent();
            App.LogInfo("MainWindow InitializeComponent succeeded");

            var collector = new WindowsHardwareCollector();
            var serializer = new EvidenceSerializer();
            DataContext = new MainViewModel(collector, serializer);
            App.LogInfo("MainWindow DataContext initialized successfully");

            _pages = new[] { Page0, Page1, Page2, Page3 };

            Loaded += (s, e) => App.LogInfo("MainWindow Loaded event fired");
            Closing += (s, e) => App.LogInfo($"MainWindow.Closing fired. Cancel={e.Cancel}\n{Environment.StackTrace}");
            Closed += (s, e) => App.LogInfo($"MainWindow.Closed fired.\n{Environment.StackTrace}");
        }
        catch (System.Exception ex)
        {
            App.LogInfo($"MainWindow constructor exception: {ex.GetType().Name} - {ex.Message}\n{ex.StackTrace}");
            throw;
        }
    }

    private void Nav_Checked(object sender, RoutedEventArgs e)
    {
        if (sender is RadioButton rb && rb.Tag is string tagStr && int.TryParse(tagStr, out int idx))
        {
            if (_pages == null) return;
            for (int i = 0; i < _pages.Length; i++)
            {
                _pages[i].Visibility = i == idx ? Visibility.Visible : Visibility.Collapsed;
            }
        }
    }

    private void CategoryChip_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Content is string category && DataContext is MainViewModel vm)
        {
            vm.SelectedCategory = category;
        }
    }

    private void BtnMinimize_Click(object sender, RoutedEventArgs e)
    {
        WindowState = WindowState.Minimized;
    }

    private void BtnMaximize_Click(object sender, RoutedEventArgs e)
    {
        WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
    }

    private void BtnClose_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }
}
