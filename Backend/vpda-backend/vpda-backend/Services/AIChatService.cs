using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace VPDA.Backend.Services;

public class AIChatService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public AIChatService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public async Task<string> AskAsync(string message)
    {
        var apiKey = Environment.GetEnvironmentVariable("ApiKey");

        if (string.IsNullOrEmpty(apiKey))
            return "Groq API Key not found";

        var request = new
        {
            model = "llama-3.3-70b-versatile",
            messages = new[]
            {
            new { role = "system", content = "You are a helpful personal assistant." },
            new { role = "user", content = message }
        }
        };

        var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.groq.com/openai/v1/chat/completions"
        );

        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", apiKey);

        httpRequest.Content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _http.SendAsync(httpRequest);
        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return "AI Error: " + json;

        using var doc = JsonDocument.Parse(json);

        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!;
    }
}
