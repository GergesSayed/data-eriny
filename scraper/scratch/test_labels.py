import re

# Let's write a simulation/test to check how to cleanly parse Google Maps listings.
# On Google Maps, listings have classes like Nv2PK or anchor tags like a.hfpxzc.
# Inside a.hfpxzc, the aria-label contains the business name.
# But directions buttons also have aria-label="الحصول على الاتجاهات إلى [Business Name]".
# Rating strings look like "4.5 نجمة" or "4.5 (102)".
#
# If the regex matches `aria-label="([^"]{5,120})"` globally on the entire page source:
# 1. It matches the main business card anchor: aria-label="الجنة للاعمال النظافة"
# 2. It matches the directions button: aria-label="الحصول على الاتجاهات إلى الجنة للاعمال النظافة"
# 3. It matches the website link: aria-label="الانتقال إلى موقع الجنة للاعمال النظافة الإلكتروني"
# 4. It matches the rating: aria-label="5.0 نجمة"
# This explains why we have so many duplicate entries for the exact same place but with UI prefix names!
#
# Also, matching phone numbers globally using `re.findall(phone_pattern, source)` extracts all phone numbers
# on the page, and then assigns them sequentially using `phones[added % len(phones)]` or a fallback.
# Since all these UI actions belong to the same listing, and the order gets out of sync, they all get the first matched phone number.

def clean_label(label):
    # Skip direction, website, rating, share, save buttons
    label_lower = label.lower()
    skip_prefixes = [
        'الحصول على الاتجاهات',
        'اتجاهات',
        'directions to',
        'الانتقال إلى موقع',
        'موقع ويب',
        'website for',
        'زيارة موقع',
        'نجمة',
        'star',
        'التقييم',
        'reviews',
        'مراجعة',
        'مراجعات',
        'اتصال بـ',
        'اتصال هاتفي',
        'call ',
        'حفظ',
        'save ',
        'مشاركة',
        'share ',
    ]
    for prefix in skip_prefixes:
        if prefix in label_lower:
            return None
    return label.strip()

print("Clean label test:")
print("1:", clean_label("الجنة للاعمال النظافة"))
print("2:", clean_label("الحصول على الاتجاهات إلى الجنة للاعمال النظافة"))
print("3:", clean_label("الانتقال إلى موقع الجنة للاعمال النظافة الإلكتروني"))
print("4:", clean_label("5.0 نجمة"))
