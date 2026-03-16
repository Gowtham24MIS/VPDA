using Microsoft.AspNetCore.Mvc;
using VPDA.Backend.Data;
using VPDA.Backend.Models;
using VPDA.Backend.Services;

namespace VPDA.Backend.Controllers;



[ApiController]
[Route("api/voice")]
public class VoiceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AIChatService _ai;

    public VoiceController(AppDbContext context, AIChatService ai)
    {
        _context = context;
        _ai = ai;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessText([FromBody] VoiceRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Text))
            return BadRequest(new { error = "Text is required" });

        var intent = IntentParser.GetIntent(request.Text);

        if (intent == "MEETING")
        {
            var meeting = new Meetings
            {
                Person = IntentParser.ExtractPerson(request.Text),
                DateTime = DateTime.Now.AddDays(1)
            };

            _context.Meetings.Add(meeting);
            _context.SaveChanges();

            return Ok(new { reply = "Meeting scheduled successfully" });
        }

        if (intent == "REMINDER")
        {
            var reminder = new Reminders
            {
                Message = request.Text,
                RemindAt = DateTime.Now.AddHours(1)
            };

            _context.Reminders.Add(reminder);
            _context.SaveChanges();

            return Ok(new { reply = "Reminder set successfully" });
        }

        // 🔥 NEW: If no intent → send to AI
        var aiReply = await _ai.AskAsync(request.Text);
        return Ok(new { reply = aiReply });
    }

    // ?? MARK COMPLETED
    [HttpPost("complete/meeting/{id}")]
    public IActionResult CompleteMeeting(int id)
    {
        var meeting = _context.Meetings.Find(id);
        if (meeting == null) return NotFound();

        meeting.IsCompleted = true;
        _context.SaveChanges();
        return Ok();
    }

    [HttpPost("complete/reminder/{id}")]
    public IActionResult CompleteReminder(int id)
    {
        var reminder = _context.Reminders.Find(id);
        if (reminder == null) return NotFound();

        reminder.IsCompleted = true;
        _context.SaveChanges();
        return Ok();
    }

    // ?? POPUP SUPPORT (due reminders)
    [HttpGet("reminders/due")]
    public IActionResult GetDueReminders()
    {
        var now = DateTime.Now;

        var due = _context.Reminders
            .Where(r => !r.IsCompleted && r.RemindAt <= now)
            .ToList();

        return Ok(due);
    }
}
