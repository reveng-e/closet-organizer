from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .models import ClothingItem
import uuid
from collections import defaultdict
import json
import mimetypes

def index(request):
    if 'user_id' not in request.session:
        request.session['user_id'] = str(uuid.uuid4())
    
    user_id = request.session['user_id']

    if request.method == 'POST':
        type = request.POST.get('type')

        if type == 'add':
            name = request.POST.get('itemName')
            category = request.POST.get('itemCategory')
            description = request.POST.get('itemDescription')
            image_file = request.FILES.get('imageInput')  # Changed from request.POST to request.FILES
            try:
                item_data = {
                    'name': name,
                    'category': category,
                    'description': description,
                    'user_id': user_id
                }
                
                # Handle image upload to MongoDB
                if image_file:
                    # Read the image file content
                    image_content = image_file.read()
                    item_data['image_data'] = image_content
                    item_data['image_filename'] = image_file.name
                    item_data['image_content_type'] = image_file.content_type
                
                new_item = ClothingItem.objects.create(**item_data)
                
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        elif type == 'delete':
            try:
                item_id = request.POST.get('item_id')
                item = ClothingItem.objects.get(id=item_id, user_id=user_id)
                item.delete()
            except (ClothingItem.DoesNotExist, json.JSONDecodeError):
                return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

    items = ClothingItem.objects.filter()
    categorized_items = defaultdict(list)
    for item in items:
        # Only include items that have valid IDs
        print(item)  # Debug print
        if item.id is not None:
            categorized_items[item.category].append(item)
        else:
            # Log or handle items with None ID (for debugging)
            print(f"Warning: Item '{item.name}' has None ID, skipping...")
    
    return render(request, 'index.html', {'categorized_items': dict(categorized_items)})

def serve_image(request, item_id):
    """Serve image from MongoDB"""
    try:
        # Get the user_id from session
        user_id = request.session.get('user_id')
        if not user_id:
            return HttpResponse('Not authorized', status=401)
        
        # Get the item
        item = ClothingItem.objects.get(id=item_id, user_id=user_id)
        
        if not item.image_data:
            return HttpResponse('No image found', status=404)
        
        # Determine content type
        content_type = item.image_content_type or 'image/jpeg'
        
        # Create response with image data
        response = HttpResponse(item.image_data, content_type=content_type)
        
        # Set cache headers for better performance
        response['Cache-Control'] = 'max-age=3600'  # Cache for 1 hour
        
        return response
        
    except ClothingItem.DoesNotExist:
        return HttpResponse('Image not found', status=404)
    except Exception as e:
        return HttpResponse(f'Error serving image: {str(e)}', status=500)
