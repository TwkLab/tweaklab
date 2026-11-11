using System.Windows;
using Twk.Agent.App.ViewModels;
using Twk.Agent.Infrastructure.Serialization;
using Twk.Agent.Windows.Collectors;

namespace Twk.Agent.App;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        var collector = new WindowsHardwareCollector();
        var serializer = new EvidenceSerializer();
        DataContext = new MainViewModel(collector, serializer);
    }
}
