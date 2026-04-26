"""Generate professional CodeMaster Academy icon, adaptive icon, splash, favicon."""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/app/frontend/assets/images"
os.makedirs(OUT, exist_ok=True)

BLUE = (59, 130, 246)
PURPLE = (139, 92, 246)
DARK = (15, 23, 42)
WHITE = (255, 255, 255)


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def make_gradient(size, top_color, bottom_color, diagonal=True):
    img = Image.new("RGB", size, top_color)
    px = img.load()
    w, h = size
    for y in range(h):
        for x in range(w):
            t = ((x + y) / (w + h)) if diagonal else (y / h)
            px[x, y] = lerp_color(top_color, bottom_color, t)
    return img


def add_rounded_corners(img: Image.Image, radius: int) -> Image.Image:
    rgba = img.convert("RGBA")
    mask = Image.new("L", rgba.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, rgba.size[0], rgba.size[1]), radius=radius, fill=255)
    rgba.putalpha(mask)
    return rgba


def draw_cm_logo(canvas: Image.Image, center, size, color=WHITE):
    """Draw stylized 'CM' lettering centered."""
    draw = ImageDraw.Draw(canvas)
    cx, cy = center
    # Try to find a system bold font
    font = None
    for path in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    ]:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, size)
                break
            except Exception:
                pass
    if font is None:
        font = ImageFont.load_default()

    text = "CM"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pos = (cx - tw // 2 - bbox[0], cy - th // 2 - bbox[1])
    # Soft shadow
    draw.text((pos[0] + 4, pos[1] + 6), text, fill=(0, 0, 0, 80), font=font)
    draw.text(pos, text, fill=color, font=font)
    # Brackets accent
    bracket_color = (255, 255, 255, 200)
    draw.line([(cx - tw // 2 - 30, cy - th // 2 + 10), (cx - tw // 2 - 50, cy), (cx - tw // 2 - 30, cy + th // 2 - 10)], fill=bracket_color, width=8)
    draw.line([(cx + tw // 2 + 30, cy - th // 2 + 10), (cx + tw // 2 + 50, cy), (cx + tw // 2 + 30, cy + th // 2 - 10)], fill=bracket_color, width=8)


def make_icon(size: int, output_path: str, rounded: bool = False, padding: int = 0):
    bg = make_gradient((size, size), BLUE, PURPLE, diagonal=True)
    if padding > 0:
        # Inset content - keep gradient as background but draw smaller logo
        draw_cm_logo(bg, (size // 2, size // 2), int(size * 0.45))
    else:
        draw_cm_logo(bg, (size // 2, size // 2), int(size * 0.5))
    if rounded:
        bg = add_rounded_corners(bg, radius=int(size * 0.22))
    bg.save(output_path)
    print(f"  ✓ {output_path} ({size}x{size})")


def make_splash(width: int, height: int, output_path: str):
    bg = make_gradient((width, height), BLUE, PURPLE, diagonal=False)
    # Logo centered, smaller
    logo_size = min(width, height) // 3
    draw_cm_logo(bg, (width // 2, height // 2), logo_size)
    # Subtitle
    draw = ImageDraw.Draw(bg)
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    if os.path.exists(font_path):
        font = ImageFont.truetype(font_path, 28)
        text = "CodeMaster Academy"
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        draw.text(((width - tw) // 2, height // 2 + logo_size // 2 + 40), text, fill=(255, 255, 255, 220), font=font)
    bg.save(output_path)
    print(f"  ✓ {output_path} ({width}x{height})")


def make_feature_graphic(width: int, height: int, output_path: str):
    """Google Play feature graphic: 1024x500"""
    bg = make_gradient((width, height), BLUE, PURPLE, diagonal=True)
    draw = ImageDraw.Draw(bg)
    # Logo on left
    logo_size = height - 120
    cx, cy = 200, height // 2
    draw_cm_logo(bg, (cx, cy), logo_size // 2)
    # Texts on right
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    if os.path.exists(font_path):
        title_font = ImageFont.truetype(font_path, 56)
        sub_font = ImageFont.truetype(font_path, 28)
        draw.text((420, height // 2 - 80), "CodeMaster Academy", fill=WHITE, font=title_font)
        draw.text((420, height // 2 - 10), "Impara a programmare da zero", fill=(255, 255, 255, 230), font=sub_font)
        draw.text((420, height // 2 + 40), "17 linguaggi · AI Tutor · Certificati", fill=(255, 255, 255, 200), font=sub_font)
    bg.save(output_path)
    print(f"  ✓ {output_path} ({width}x{height})")


if __name__ == "__main__":
    # Standard icon (square 1024)
    make_icon(1024, f"{OUT}/icon.png", rounded=False)
    # Adaptive icon foreground (transparent bg with logo only) - simulate with smaller bordered
    make_icon(1024, f"{OUT}/adaptive-icon.png", rounded=False, padding=0)
    # Favicon for web (32x32)
    make_icon(192, f"{OUT}/favicon.png", rounded=False)
    # Splash (portrait)
    make_splash(1284, 2778, f"{OUT}/splash-icon.png")
    # Splash small (used by expo)
    make_icon(400, f"{OUT}/splash-icon-small.png", rounded=False)

    # Feature graphic for Google Play
    os.makedirs("/app/store_assets", exist_ok=True)
    make_feature_graphic(1024, 500, "/app/store_assets/feature_graphic_android.png")
    # Store icons for App Store (1024x1024)
    make_icon(1024, "/app/store_assets/app_store_icon_1024.png")
    make_icon(512, "/app/store_assets/play_store_icon_512.png")
    print("\n✅ All assets generated successfully")
