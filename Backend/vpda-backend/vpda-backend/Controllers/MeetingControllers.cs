using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;  
using System.Data;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class MeetingsController : ControllerBase
{
    private readonly string _connectionString;

    public MeetingsController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var meetings = new List<object>();

        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand(@"
                SELECT Id, Person, DateTime, IsCompleted 
                FROM Meetings 
                ORDER BY DateTime", connection);

            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                meetings.Add(new
                {
                    id = reader.GetInt32("Id"),
                    person = reader.GetString("Person"),
                    dateTime = reader.GetDateTime("DateTime").ToString("MMM dd, yyyy hh:mm tt"),
                    isCompleted = reader.GetBoolean("IsCompleted")
                });
            }

            return Ok(meetings);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
