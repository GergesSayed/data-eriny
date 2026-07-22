# -*- coding: utf-8 -*-
import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def test_scrape():
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--lang=ar')
    driver = webdriver.Chrome(options=options)
    
    try:
        url = "https://www.google.com/maps/search/laundry+cairo"
        print("Navigating to URL...")
        driver.get(url)
        time.sleep(5)
        
        # Find business cards by selector
        # Google Maps uses div.Nv2PK for each card listing.
        cards = driver.find_elements(By.CSS_SELECTOR, 'div.Nv2PK')
        print(f"Found {len(cards)} card elements.")
        
        for idx, card in enumerate(cards[:5]):
            print(f"\n--- Card {idx+1} ---")
            text = card.text
            print("Text content:")
            print(text)
            
            # Find links inside card
            links = card.find_elements(By.TAG_PATH if hasattr(By, 'TAG_PATH') else By.TAG_NAME, 'a')
            for link in links:
                href = link.get_attribute('href')
                aria = link.get_attribute('aria-label')
                print(f"Link aria-label: {aria} | href: {href[:60] if href else None}")
                
    finally:
        driver.quit()

if __name__ == '__main__':
    test_scrape()
