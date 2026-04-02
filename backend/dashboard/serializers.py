from rest_framework import serializers
from .models import Client, Team, Segment, Project

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class SegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Segment
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')
    team_name = serializers.ReadOnlyField(source='team.name')
    segment_name = serializers.ReadOnlyField(source='segment.name')

    class Meta:
        model = Project
        fields = '__all__'
