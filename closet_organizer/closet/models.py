from django.db import models

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
    image = models.ImageField(upload_to='clothing_items/', blank=True, null=True)
    user_id = models.CharField(max_length=255)

    def __str__(self):
        return self.name