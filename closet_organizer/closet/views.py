from django.shortcuts import render
from django.http import JsonResponse
from .models import ClothingItem
import uuid
from collections import defaultdict
import json

def index(request):
    if 'user_id' not in request.session:
        request.session['user_id'] = str(uuid.uuid4())
    
    user_id = request.session['user_id']

    if request.method == 'POST':
        type = request.POST.get('type')
        if type == 'additem':
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
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        elif type == 'deleteitem':
            try:
                item_id = request.POST.get('item_id')
                item = ClothingItem.objects.get(id=item_id, user_id=user_id)
                item.delete()
            except (ClothingItem.DoesNotExist, json.JSONDecodeError):
                return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)
    
    
    items = ClothingItem.objects.filter(user_id=user_id)
    categorized_items = defaultdict(list)
    for item in items:
        categorized_items[item.category].append(item)
    
    return render(request, 'index.html', {'categorized_items': dict(categorized_items)})
