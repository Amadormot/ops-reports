from django.contrib import admin
from .models import Client, Team, Segment, Project

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Segment)
class SegmentAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'actual_end_date', 'delivery_count', 'team', 'segment')
    list_filter = ('client', 'team', 'segment', 'actual_end_date')
    search_fields = ('name', 'impediments')
    ordering = ('-actual_end_date',)
