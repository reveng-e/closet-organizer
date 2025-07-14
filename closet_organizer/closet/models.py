from django.db import models
import base64

class ClothingItem(models.Model):
    CATEGORY_CHOICES = [
        ('Shirt', 'Shirt'),
        ('Pants', 'Pants'),
        ('Hoodie', 'Hoodie'),
        ('Jacket', 'Jacket'),
        ('Dress', 'Dress'),
        ('Skirt', 'Skirt'),
        ('Shoes', 'Shoes'),
        ('Accessory', 'Accessory'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)
    
    # Store image as binary data in MongoDB
    image_data = models.BinaryField(blank=True, null=True)
    image_filename = models.CharField(max_length=255, blank=True, null=True)
    image_content_type = models.CharField(max_length=100, blank=True, null=True)
    
    user_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    def get_image_base64(self):
        """Return base64 encoded image data for display"""
        if self.image_data:
            return base64.b64encode(self.image_data).decode('utf-8')
        return None
    
    def get_image_data_url(self):
        """Return data URL for direct use in HTML img src"""
        if self.image_data and self.image_content_type:
            base64_data = self.get_image_base64()
            return f"data:{self.image_content_type};base64,{base64_data}"
        return None