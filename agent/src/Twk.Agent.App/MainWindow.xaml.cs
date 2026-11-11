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
        InitializeComponent();

        var collector = new WindowsHardwareCollector();
        var serializer = new EvidenceSerializer();
        DataContext = new MainViewModel(collector, serializer);

        _pages = new[] { Page0, Page1, Page2, Page3 };
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
}
