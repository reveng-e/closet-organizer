
from djongo import models
from django.contrib.auth.models import User

class Item(models.Model):
    """
    Represents an item in the closet.
    """
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

    name = models.CharField(max_length=255, help_text="Name of the item (e.g., 'Blue Jeans').")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, help_text="Category of the item.")
    description = models.TextField(blank=True, null=True, help_text="Optional description of the item.")
    image = models.ImageField(upload_to='closet_items/', blank=True, null=True, help_text="Optional image of the item.")
    created_at = models.DateTimeField(auto_now_add=True, help_text="The date and time the item was added.")
    user = models.ForeignKey(User, on_delete=models.CASCADE, help_text="The user who owns this item.")

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'items'
        verbose_name = 'Closet Item'
        verbose_name_plural = 'Closet Items'
