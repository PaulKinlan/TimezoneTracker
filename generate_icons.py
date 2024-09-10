from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create a new image with a white background
    image = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(image)

    # Draw a green circle
    circle_diameter = int(size * 0.8)
    circle_xy = ((size - circle_diameter) // 2,) * 2
    circle_xy += (circle_xy[0] + circle_diameter,) * 2
    draw.ellipse(circle_xy, fill='#4CAF50')

    # Add text
    font_size = size // 4
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except IOError:
        font = ImageFont.load_default()

    text = "WC"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_position = ((size - text_width) // 2, (size - text_height) // 2)
    draw.text(text_position, text, font=font, fill='white')

    # Save the image
    image.save(filename)

# Ensure the icons directory exists
os.makedirs('static/icons', exist_ok=True)

# Create icons
create_icon(192, 'static/icons/icon-192x192.png')
create_icon(512, 'static/icons/icon-512x512.png')

print("Icons created successfully!")
