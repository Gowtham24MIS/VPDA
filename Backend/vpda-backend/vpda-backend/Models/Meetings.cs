namespace VPDA.Backend.Models;

public class Meetings
{
    public int Id { get; set; }
    public string Person { get; set; } = string.Empty;
    public DateTime DateTime { get; set; }

    // NEW
    public bool IsCompleted { get; set; } // force diff
}
