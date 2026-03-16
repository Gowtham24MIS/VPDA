using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;  
using System.Data;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class RemindersController : ControllerBase
{
    private readonly string _connectionString;

    public RemindersController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var reminders = new List<object>();

        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand(@"
                SELECT Id, Message, RemindAt, IsCompleted 
                FROM Reminders 
                ORDER BY RemindAt", connection);

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                reminders.Add(new
                {
                    id = reader.GetInt32("Id"),
                    message = reader.GetString("Message"),
                    remindAt = reader.GetDateTime("RemindAt").ToString("MMM dd, yyyy hh:mm tt"),
                    isCompleted = reader.GetBoolean("IsCompleted")
                });
            }

            return Ok(reminders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
