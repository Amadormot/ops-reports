from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Segment(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    STATUS_CHOICES = [
        ('PLANEJAMENTO', 'Planejado'),
        ('EM_IMPLANTACAO', 'Em Implantação'),
        ('ENTREGUE', 'Entregue'),
    ]

    STATUS_MAP = {
        'planja': 'PLANEJAMENTO',
        'planejamento': 'PLANEJAMENTO',
        'planejado': 'PLANEJAMENTO',
        'planejar': 'PLANEJAMENTO',
        'em implantacao': 'EM_IMPLANTACAO',
        'em implantação': 'EM_IMPLANTACAO',
        'implantacao': 'EM_IMPLANTACAO',
        'implantação': 'EM_IMPLANTACAO',
        'em andamento': 'EM_IMPLANTACAO',
        'andamento': 'EM_IMPLANTACAO',
        'entregue': 'ENTREGUE',
        'concluido': 'ENTREGUE',
        'concluído': 'ENTREGUE',
        'finalizado': 'ENTREGUE',
    }

    name = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    actual_end_date = models.DateField(null=True, blank=True)
    delivery_count = models.IntegerField(default=0, help_text='Quantidade de entregas do cliente (coluna Total da planilha)')
    segment = models.ForeignKey(Segment, on_delete=models.SET_NULL, null=True, blank=True)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    impediments = models.TextField(null=True, blank=True)
    squad = models.CharField(max_length=150, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANEJAMENTO')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
