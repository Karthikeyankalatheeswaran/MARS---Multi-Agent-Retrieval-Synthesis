from django.urls import path, include
from django.http import HttpResponse

def health_check(request):
    return HttpResponse("MARS Backend is running!", status=200)

urlpatterns = [
    path('', health_check, name='health-check'),
    path('api/', include('api.urls')),
]
