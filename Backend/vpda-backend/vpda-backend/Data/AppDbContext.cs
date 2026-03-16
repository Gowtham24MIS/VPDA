using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using VPDA.Backend.Models;

namespace VPDA.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Meetings> Meetings { get; set; }
    public DbSet<Reminders> Reminders { get; set; }
}
