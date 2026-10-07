# Sklada film "fronty baru" z twardych ciec: baza + klisze PMB na obu modulach.
import urllib.request, io, subprocess, os
from PIL import Image, ImageChops
C='https://d8j0ntlcm91z4.cloudfront.net/user_3ErsnHFAg2T7i8FCPtDde7rCO2i/'
P='https://pimpmybar.github.io/oferty/wesele/assets/klisze/'
def get(u): return Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read())).convert('RGB')
base=get(C+'hf_20261006_120125_442f7e44-83e8-40ab-9ea9-6ce94befcf8b.png')
green=get(C+'hf_20261006_125340_a086eced-042e-4f69-8177-964b4b406239.png')
olive=get(C+'hf_20261006_121858_4b905690-f3c4-4c1b-b9d6-a5cb45ef529c.png')
W,H=base.size; sx=W/1344; sy=H/752
R=[(round(324*sx),round(387*sy),round(664*sx),round(624*sy)),(round(680*sx),round(387*sy),round(1020*sx),round(624*sy))]
KL=['deski-kolor','deski-jasne','deski-biale','deski-bielone','deski-czarne','paski','kamien','cegla-czarna','drewno','cegla-biala']
SOLID={'black':(22,22,22),'sage':(138,154,130),'navy':(31,42,68),'blush':(226,191,191)}
def frame(k):
    if k=='silver': return base
    if k=='bar-green': return green.resize((W,H))
    if k=='bar-olive': return olive.resize((W,H))
    im=base.copy()
    for i,r in enumerate(R):
        w,h=r[2]-r[0],r[3]-r[1]
        if k=='gold': t=ImageChops.multiply(base.crop(r),Image.new('RGB',(w,h),(224,178,90)))
        elif k in SOLID: t=Image.new('RGB',(w,h),SOLID[k])
        else:
            s=get(P+KL[int(k[1:])-1]+('-l' if i==0 else '-r')+'.jpg'); s=s.resize((w,round(s.height*w/s.width)),Image.LANCZOS); t=s.crop((0,0,w,h))
        im.paste(t,r[:2])
    return im
SEQ=['silver','k1','gold','k2','k3','black','k4','k5','sage','k6','k7','navy','k8','k9','blush','k10','bar-green','bar-olive']
NAME={'silver':'Lustro srebrne','gold':'Lustro złote','black':'Czarny mat','sage':'Zielony','navy':'Granat','blush':'Pudrowy róż','bar-green':'Bar zielony z kasetonami, 2 m','bar-olive':'Bar oliwkowy, 3 m',
'k1':'Deski kolorowe','k2':'Deski jasne','k3':'Deski białe','k4':'Deski bielone','k5':'Deski czarne','k6':'Paski','k7':'Kamień','k8':'Czarna cegła','k9':'Drewno','k10':'Biała cegła'}
# VERT: wersja pionowa 1080x1920 na Instagram
from PIL import ImageFilter, ImageDraw, ImageFont, ImageEnhance
fl=subprocess.check_output('fc-list : file family',shell=True).decode().splitlines()
def font(w,sz):
    c=[l.split(':')[0] for l in fl if 'Montserrat' in l and w in l.split(':')[0]] or [l.split(':')[0] for l in fl if 'Montserrat' in l]
    return ImageFont.truetype(sorted(c,key=len)[0],sz)
FB,FM=font('Bold',78),font('SemiBold',50); FS=font('Medium',34)
def vert(fr,k):
    bg=fr.crop((W//2-211,0,W//2+212,H)).resize((1080,1920)).filter(ImageFilter.GaussianBlur(28)); bg=ImageEnhance.Brightness(bg).enhance(.55)
    if k.startswith('bar'): fg=fr.resize((1080,round(H*1080/W)),Image.LANCZOS)
    else: fg=fr.crop((252,40,1092,712)).resize((1080,864),Image.LANCZOS)
    bg.paste(fg,(0,(1920-fg.height)//2+40)); d=ImageDraw.Draw(bg)
    d.text((540,330),'JEDEN BAR.',font=FB,fill='white',anchor='mm'); d.text((540,425),'KAŻDY FRONT.',font=FB,fill=(236,220,182),anchor='mm')
    d.text((540,1530),NAME[k],font=FM,fill='white',anchor='mm'); d.text((540,1700),'pimpmybar.pl',font=FS,fill=(236,220,182),anchor='mm')
    return bg
os.makedirs('f',exist_ok=True); os.makedirs('v',exist_ok=True); L=[]
for n,k in enumerate(SEQ):
    fr=frame(k); fr.save('f/%02d.png'%n); vert(fr,k).save('v/%02d.png'%n)
    L+= ["file '%%s/%02d.png'"%n, 'duration %s'%(1.4 if k.startswith('bar') else 0.6)]
L.append("file '%%s/%02d.png'"%(len(SEQ)-1))
for d,o in (('f','out.mp4'),('v','insta.mp4')):
    open('l.txt','w').write('\n'.join(L).replace('%s',d))
    subprocess.check_call('ffmpeg -y -loglevel error -f concat -i l.txt -vf fps=30,format=yuv420p -c:v libx264 -crf 18 -movflags +faststart '+o,shell=True)
for n in (3,16): Image.open('v/%02d.png'%n).resize((540,960)).save('p%d.jpg'%n,quality=72)
print(W,H,os.path.getsize('out.mp4'),os.path.getsize('insta.mp4'))
