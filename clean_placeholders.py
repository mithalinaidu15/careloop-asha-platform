with open('app.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('placeholder="e.g. Smt. Sumitra Bai"', 'placeholder="Enter your full name"')
text = text.replace('placeholder="e.g. Ramanagara"', 'placeholder="Enter district name"')
text = text.replace('placeholder="e.g. Channapatna"', 'placeholder="Enter taluk / block"')
text = text.replace('placeholder="e.g. Kootagal Grama"', 'placeholder="Enter village / ward"')
text = text.replace('placeholder="e.g. Kootagal Primary Health Centre"', 'placeholder="Enter PHC / Sub-Centre name"')
text = text.replace('placeholder="e.g. District Hospital Ramanagara DEIC Hub"', 'placeholder="Enter DEIC center name"')
text = text.replace("district: f.district || 'Ramanagara'", "district: f.district || 'Local District'")
text = text.replace("taluk: f.taluk || 'Channapatna'", "taluk: f.taluk || 'Local Taluk'")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Cleaned placeholders!")
