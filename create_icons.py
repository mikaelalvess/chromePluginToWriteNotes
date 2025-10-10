#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import sys

def create_icon(size, filename):
    """Create a square icon with a blue background and white 'W' text."""
    # Create image with blue background
    img = Image.new('RGBA', (size, size), color='#4a90e2')
    draw = ImageDraw.Draw(img)

    # Draw rounded rectangle (create mask)
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = int(size * 0.15)
    mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=255)

    # Apply mask
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0), mask)

    # Draw text
    draw = ImageDraw.Draw(output)

    # Try to use a system font, fall back to default
    try:
        # Try common system fonts
        font_size = int(size * 0.55)
        for font_name in ['Arial Bold', 'Helvetica Bold', 'Arial', 'DejaVuSans-Bold']:
            try:
                font = ImageFont.truetype(font_name, font_size)
                break
            except:
                continue
        else:
            # If no truetype font found, use default
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Draw 'W' in center
    text = "W"

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculate position to center text
    x = (size - text_width) / 2 - bbox[0]
    y = (size - text_height) / 2 - bbox[1]

    draw.text((x, y), text, fill='white', font=font)

    # Save the image
    output.save(filename, 'PNG')
    print(f'Created {filename} ({size}x{size})')

def main():
    sizes = [16, 48, 128]

    for size in sizes:
        filename = f'icon{size}.png'
        create_icon(size, filename)

    print('\nIcons created successfully!')

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print('PIL/Pillow not installed. Install it with: pip3 install Pillow')
        sys.exit(1)
