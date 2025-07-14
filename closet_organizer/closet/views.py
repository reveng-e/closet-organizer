from django.shortcuts import render
from django.http import JsonResponse
from .models import ClothingItem
import uuid

def index(request):
    if 'user_id' not in request.session:
        request.session['user_id'] = str(uuid.uuid4())
    
    user_id = request.session['user_id']

    if request.method == 'POST':
        name = request.POST.get('itemName')
        category = request.POST.get('itemCategory')
        description = request.POST.get('itemDescription')
        image = request.FILES.get('imageInput')

        try:
            ClothingItem.objects.create(
                name=name,
                category=category,
                description=description,
                image=image,
                user_id=user_id
            )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})

    items = ClothingItem.objects.filter(user_id=user_id)
    return render(request, 'index.html', {'items': items})
