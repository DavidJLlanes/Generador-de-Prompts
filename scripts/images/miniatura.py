"""Exporta miniaturas del proyecto: 300x400, WebP calidad 70 (Pillow)."""
import argparse
from pathlib import Path
from PIL import Image, ImageOps

SIZE = (300, 400)
QUALITY = 70


def export_thumbnail(image, destination):
    destination = Path(destination)
    if destination.suffix.lower() != '.webp':
        raise ValueError('La miniatura debe tener extensión .webp')
    image = ImageOps.exif_transpose(image).convert('RGB')
    image = ImageOps.pad(image, SIZE, method=Image.Resampling.LANCZOS,
                         color=(225, 222, 218), centering=(0.5, 0.5))
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, 'WEBP', quality=QUALITY, method=6)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    with Image.open(args.source) as image:
        export_thumbnail(image, args.destination)
