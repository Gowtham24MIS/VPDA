using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpda_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsCompletedToMeetingsAndReminders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
        name: "IsCompleted",
        table: "Meetings",
        type: "bit",
        nullable: false,
        defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "Reminders",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
       name: "IsCompleted",
       table: "Meetings");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "Reminders");
        }
    }
}
