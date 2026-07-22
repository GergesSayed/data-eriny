# -*- coding: utf-8 -*-
import re

card_texts = [
    """Tala Laundry
Tala Laundry
4.7
خدمات تنظيف الملابس · المقريزي
مفتوح · يغلق عند الساعة ٩ م · 02 27357440

الاتجاهات""",
    """Dry clean Max-care دراي كلين ماكس كير
Dry clean Max-care دراي كلين ماكس كير
4.6
تنظيف جاف للملابس · خلف البنك المركزي, 8 شارع علوي, شارع شريف باشا
مفتوح · يغلق عند الساعة ٩ م · 02 23939389

الاتجاهات""",
    """Express
Express
2.8
تنظيف جاف للملابس · 483P+RF7
02 26445839

الاتجاهات""",
    """Cairo claen
Cairo claen
5.0
خدمات تنظيف الملابس · 8 متفرع من, شارع الحجاز
012 78661709

الاتجاهات""",
    """Viena Dry Clean – Dry Cleaning & Laundry
Viena Dry Clean – Dry Cleaning & Laundry
4.7
تنظيف جاف للملابس · 7 حسن صبري
مغلق · يفتح يوم الاثنين عند الساعة ١٠ ص · 011 21879790

الموقع الإلكتروني

الاتجاهات"""
]

def parse_card(text):
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return None
        
    company = {}
    
    # 1. Name
    name = lines[0]
    # Check if Arabic characters exist
    if any('\u0600' <= c <= '\u06FF' for c in name):
        company['nameAr'] = name
    else:
        company['nameEn'] = name
        
    # 2. Rating
    rating = None
    for line in lines[1:4]:
        if re.match(r'^\d\.\d$', line):
            rating = line
            break
    if rating:
        company['rating'] = rating
        
    # 3. Category & Address
    # Usually contains " · " (dot separator)
    address_line = None
    for line in lines:
        if ' · ' in line and not any(k in line for k in ['يفتح', 'يغلق', 'مفتوح', 'مغلق']):
            address_line = line
            break
    if address_line:
        parts = address_line.split(' · ')
        company['category'] = parts[0].strip()
        if len(parts) > 1:
            company['address'] = parts[1].strip()
            
    # 4. Phone number
    phone_pattern = r'(?:\+?20[\s\-.]?)?(?:0?2[\s\-.]?\d{3,4}[\s\-.]?\d{4}|0?1[0125][\s\-.]?\d{3,4}[\s\-.]?\d{4}|19\d{3}|16\d{3})'
    # Try to search for phone in all lines
    full_text = " ".join(lines)
    phones = re.findall(phone_pattern, full_text)
    if phones:
        company['phone1'] = re.sub(r'[\s\-.]', '', phones[0])
        
    return company

for i, text in enumerate(card_texts):
    print(f"Company {i+1}:", parse_card(text))
