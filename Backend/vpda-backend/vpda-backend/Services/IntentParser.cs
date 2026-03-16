namespace VPDA.Backend.Services;

public static class IntentParser
{
    public static string GetIntent(string text)
    {
        text = text.ToLower();

        if (text.Contains("meeting"))
            return "MEETING";

        if (text.Contains("remind"))
            return "REMINDER";

        return "UNKNOWN";
    }

    public static string ExtractPerson(string text)
    {
        if (text.Contains("with"))
        {
            return text.Split("with")[1].Trim();
        }
        return "Unknown";
    }
}
