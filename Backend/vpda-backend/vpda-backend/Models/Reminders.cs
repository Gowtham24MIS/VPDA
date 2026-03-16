namespace VPDA.Backend.Models;

public class Reminders
{
    public int Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime RemindAt { get; set; }

    // NEW
    public bool IsCompleted { get; set; } // force diff
}
