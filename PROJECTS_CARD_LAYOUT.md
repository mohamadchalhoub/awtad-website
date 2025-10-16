# Public Projects Page - Card Layout Reference

## 🎨 Visual Layout Guide

### **Single Parent Project Card**

```
┌──────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════╗ │
│ ║                                          ║ │
│ ║     [Parent Project Cover Image]         ║ │ ← 16:9 aspect ratio
│ ║           (Hover: scale-105)             ║ │   Full card width
│ ║                                          ║ │
│ ║  Commercial | 2024                       ║ │ ← Badges (top-left)
│ ╚══════════════════════════════════════════╝ │
│                                              │
│  Sports Complex Building                     │ ← Title (text-lg font-semibold)
│  A modern sports facility featuring...       │ ← Description (text-sm, 2 lines max)
│                                              │
│  ────────────────────────────────────────    │ ← Border separator
│                                              │
│  ↳ Subprojects (5)                          │ ← Section header
│                                              │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ →          │ ← Horizontal scroll
│  │  │ │  │ │  │ │  │ │  │ │  │             │   80×56px thumbnails
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘             │
│  Gym  Pool Ball Field Track More            │ ← Thumbnail labels
│                                              │
│  View all 8 subprojects →                   │ ← If more than 6
│                                              │
│  ┌────────────────┐  ┌─────┐               │
│  │ View Details   │  │  ⟲  │               │ ← Action buttons
│  └────────────────┘  └─────┘               │
└──────────────────────────────────────────────┘
```

---

## 📐 Dimensions & Spacing

### **Card Dimensions:**
```
Card:
  - Width: 100% of grid column
  - Border Radius: 12px (rounded-xl)
  - Border: 1px solid gray-200
  - Shadow: sm (hover: md)
  - Padding: 16px (p-4)

Image:
  - Aspect Ratio: 16:9
  - Width: 100%
  - Object Fit: cover
  - Border Radius Top: 12px

Content Spacing:
  - space-y-3 (12px vertical gaps)
```

### **Subproject Thumbnails:**
```
Thumbnail:
  - Width: 80px (w-20)
  - Height: 56px (h-14)
  - Border Radius: 6px (rounded-md)
  - Border: 1px solid gray-200
  - Gap between: 12px (gap-3)
  
Container:
  - Display: flex
  - Overflow-x: auto
  - Padding Bottom: 8px (for scrollbar)
```

---

## 🎯 Interactive States

### **Parent Card:**
```
Default:
  border-gray-200 shadow-sm

Hover:
  shadow-md transition-shadow
  Image: scale-105 (200ms)
  Title: text-primary
```

### **Subproject Thumbnail:**
```
Default:
  border-gray-200

Hover:
  border-gray-400
  Image: scale-110 (200ms)
  Title: text-primary
```

### **Buttons:**
```
View Details:
  - Primary button style
  - Height: 32px (h-8)
  - Full width of available space
  - Text: text-xs

Share:
  - Outline variant
  - Icon only (Share2)
  - Height: 32px (h-8)
  - Width: auto
```

---

## 📱 Grid Breakpoints

### **Desktop (lg: 1024px+):**
```
Grid: 3 columns
Gap: 24px (gap-6)

┌────────┐ ┌────────┐ ┌────────┐
│  Card  │ │  Card  │ │  Card  │
│   1    │ │   2    │ │   3    │
└────────┘ └────────┘ └────────┘
```

### **Tablet (md: 768px - 1023px):**
```
Grid: 2 columns
Gap: 24px (gap-6)

┌────────┐ ┌────────┐
│  Card  │ │  Card  │
│   1    │ │   2    │
└────────┘ └────────┘
```

### **Mobile (< 768px):**
```
Grid: 1 column
Gap: 24px (gap-6)

┌────────┐
│  Card  │
│   1    │
└────────┘
┌────────┐
│  Card  │
│   2    │
└────────┘
```

---

## 🎨 Color Reference

### **Light Mode:**
```css
Card Background:     white
Border:              rgb(229, 231, 235)  /* gray-200 */
Title:               rgb(17, 24, 39)     /* gray-900 */
Description:         rgb(75, 85, 99)     /* gray-600 */
Subproject Header:   rgb(107, 114, 128)  /* gray-500 */
Divider:             rgb(243, 244, 246)  /* gray-100 */
Thumbnail Border:    rgb(229, 231, 235)  /* gray-200 */
Hover Border:        rgb(156, 163, 175)  /* gray-400 */
Link:                rgb(37, 99, 235)    /* blue-600 */
```

### **Dark Mode:**
```css
Card Background:     hsl(var(--card))
Border:              hsl(var(--border))
Title:               hsl(var(--foreground))
Description:         hsl(var(--muted-foreground))
Subproject Header:   hsl(var(--muted-foreground))
Divider:             hsl(var(--border) / 0.5)
Thumbnail Border:    hsl(var(--border))
Hover Border:        hsl(var(--primary) / 0.5)
Link:                hsl(var(--primary))
```

---

## 🖼️ Example Scenarios

### **1. Parent Project with 3 Subprojects:**
```
┌────────────────────────────────┐
│ [Image: Office Building]       │
│ Commercial | 2024              │
├────────────────────────────────┤
│ Downtown Office Tower          │
│ Modern 10-story building...    │
│                                │
│ ↳ Subprojects (3)             │
│ [Struct] [Facade] [Interior]  │
│                                │
│ [View Details] [Share]         │
└────────────────────────────────┘
```

### **2. Parent Project with 8 Subprojects:**
```
┌────────────────────────────────┐
│ [Image: Sports Complex]        │
│ Sports | 2023                  │
├────────────────────────────────┤
│ Multi-Sport Arena              │
│ Comprehensive sports...        │
│                                │
│ ↳ Subprojects (8)             │
│ [Gym][Pool][Ball][Field]... → │ ← Scrollable
│ View all 8 subprojects →      │
│                                │
│ [View Details] [Share]         │
└────────────────────────────────┘
```

### **3. Parent Project with No Subprojects:**
```
┌────────────────────────────────┐
│ [Image: Residential Home]      │
│ Residential | 2024             │
├────────────────────────────────┤
│ Modern Family Home             │
│ Contemporary design with...    │
│                                │
│ [View Details] [Share]         │
└────────────────────────────────┘
```

---

## 🔄 Scroll Behavior

### **Horizontal Scroll for Subprojects:**

```
Desktop:
  - Mouse wheel (horizontal)
  - Trackpad swipe
  - Click and drag (optional)
  - Custom scrollbar styling

Mobile:
  - Touch swipe
  - Native momentum scrolling
  - Hidden scrollbar
  
CSS:
  overflow-x: auto
  scrollbar-thin (desktop)
  -webkit-overflow-scrolling: touch (iOS)
```

---

## 🎯 Click Targets

### **Click Areas:**
```
1. Parent Image
   → Navigate to parent detail page
   
2. Parent Title/Description
   → Navigate to parent detail page
   
3. Subproject Thumbnail
   → Navigate to subproject detail page
   (stops propagation)
   
4. "View all" Link
   → Navigate to parent detail page
   (stops propagation)
   
5. "View Details" Button
   → Navigate to parent detail page
   (stops propagation)
   
6. "Share" Button
   → Open share dialog
   (stops propagation)
```

---

## 📊 Typography Scale

```
Parent Title:
  font-size: 18px (text-lg)
  font-weight: 600 (font-semibold)
  line-height: 1.75rem
  max-lines: 1 (truncate)

Parent Description:
  font-size: 14px (text-sm)
  font-weight: 400
  line-height: 1.25rem
  max-lines: 2 (line-clamp-2)

Subproject Header:
  font-size: 12px (text-xs)
  font-weight: 400
  color: gray-500

Subproject Title:
  font-size: 12px (text-xs)
  font-weight: 400
  text-align: center
  overflow: truncate

Badges (Category/Year):
  font-size: 12px (text-xs)
  font-weight: 400
  padding: 4px 8px
```

---

## 🧩 Component Hierarchy

```
<article>                          ← Card container
  <div>                           ← Image section
    <img>                         ← Main image
    <div>                         ← Badge container
      <span>Category</span>
      <span>Year</span>
    </div>
  </div>
  
  <div>                           ← Content section (p-4)
    <div>                         ← Title/Description
      <h3>Title</h3>
      <p>Description</p>
    </div>
    
    {hasSubprojects && (
      <div>                       ← Subprojects section
        <h4>Header</h4>
        <div>                     ← Scroll container
          {subprojects.map(
            <div>                 ← Thumbnail item
              <div>               ← Image wrapper
                <img>
              </div>
              <p>Title</p>
            </div>
          )}
        </div>
        {hasMore && (
          <button>View all</button>
        )}
      </div>
    )}
    
    <div>                         ← Action buttons
      <Button>View Details</Button>
      <Button>Share</Button>
    </div>
  </div>
</article>
```

---

## ✨ Animation Timings

```
Image Hover Scale:
  duration: 300ms
  timing: ease-out
  
Thumbnail Hover Scale:
  duration: 200ms
  timing: ease-out
  
Shadow Transition:
  duration: 150ms
  timing: ease-in-out
  
Text Color Change:
  duration: 150ms
  timing: ease-in-out
  
Border Color Change:
  duration: 200ms
  timing: ease-in-out
```

---

## 🎯 Summary

This card layout provides:

- ✅ **Compact design** - More projects visible
- ✅ **Clear hierarchy** - Parent contains children
- ✅ **Easy scanning** - Quick visual overview
- ✅ **Touch friendly** - Horizontal scroll works great
- ✅ **Responsive** - Adapts to all screen sizes
- ✅ **Professional** - Modern, clean aesthetic
- ✅ **Accessible** - Semantic HTML structure

The design successfully combines **elegance**, **functionality**, and **efficiency** in a single, self-contained card component.

---

**Quick Reference:** Each parent project card is approximately **450-500px tall** (depending on content), down from **800px+** in the previous design, allowing users to see **2x more projects** on screen at once.


