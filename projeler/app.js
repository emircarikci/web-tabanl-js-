window.onload = function() {
    const oyunAlani = document.getElementById('oyun-alani');
    let oyunBitti = false;
    let oyuncu;
    let engeller = [];
    let skor = 0;
    let engelHizi = 100; // Engellerin başlangıç hızı
    let enYuksekSkor = localStorage.getItem('enYuksekSkor') || 0; 
    let oyuncuCan = 1; // Oyuncunun canını tutacak değişken
    let kalanCanArtisiSuresi = 0; 
    let gorunmezlikCooldown = 0; // Görünmezlik bekleme süresi
    let kalanGorunmezlikSuresi = 0; 
    let hizArtisSayisi = 0; // Hız artışı sayacı
    let gorunurlukGuncellemeAraligi; 
    let canArtisTimer;

    // Skoru, oyuncu canını ve can artışı için 
    const skorGoster = document.createElement('div');
    skorGoster.classList.add('skor-goster');
    skorGoster.innerText = 'Skor: ' + skor + ' En Yüksek Skor: ' + enYuksekSkor; 
    document.body.appendChild(skorGoster);

    const canGoster = document.createElement('div');
    canGoster.classList.add('can-goster');
    canGoster.innerText = 'Can: ' + oyuncuCan; 
    document.body.appendChild(canGoster);

    const kalanSureGoster = document.createElement('div');
    kalanSureGoster.classList.add('kalan-sure-goster');
    kalanSureGoster.innerText = 'Can Artışı Zamanı: ' + kalanCanArtisiSuresi + ' saniye\nGörünmezlik Süresi: ' + kalanGorunmezlikSuresi + ' saniye\nGörünmezlik Bekleme Süresi: ' + gorunmezlikCooldown + ' saniye\nHız Artış Sayısı: ' + hizArtisSayisi + '\nYukarı Tuşu: Engellerin düşüş hızını arttır';
    document.body.appendChild(kalanSureGoster);

    const hareketTalimatları = document.createElement('div');
    hareketTalimatları.classList.add('hareket-talimatları');
    hareketTalimatları.innerText = 'Oyuncu Hareketleri: Sağa Hareket (→) ve Sola Hareket (←)';
    document.body.appendChild(hareketTalimatları);

    // 'q' tuşu ile canın arttırılacağını ve maksimumum canın 2 olduğunu ve bekleme süresinin 10 saniye oldugu
    const canArtisTalimatları = document.createElement('div');
    canArtisTalimatları.classList.add('can-artis-talimatları');
    canArtisTalimatları.innerText = 'Can Artışı: \'q\' tuşuna basarak canınızı arttırabilirsiniz. Maksimum canınız 2\'dir. Her artış 10 saniye bekletilir.';
    document.body.appendChild(canArtisTalimatları);

    // Boşluk tuşuna basıldığında oyuncunun görünmez olma özelliği
    document.addEventListener('keydown', oyuncuyuGorunmezYap);

    // Yukarı tuşuna basıldığında engel düşüş hızını arttır
    document.addEventListener('keydown', engelHiziniArttir);

    function oyunuBaslat() {
        // Oyuncuyu sıfırla veya oluştur
        if (oyuncu) {
            oyunAlani.removeChild(oyuncu);
        }
        oyuncu = null;

        // Engelleri kaldır
        engeller.forEach(engel => {
            oyunAlani.removeChild(engel);
        });
        engeller = [];

        // Yeni oyuncu oluştur
        oyuncu = document.createElement('div');
        oyuncu.id = 'oyuncu';
        oyunAlani.appendChild(oyuncu);
        oyuncu.style.left = '50%'; // Başlangıçta ortaya yerleştir
        oyuncu.style.visibility = 'visible'; // Oyuncuyu görünür yap

        document.addEventListener('keydown', oyuncuyuHareketEttir);

        // Engelleri oluştur
        engelOlustur();

        // 'q' tuşuna basıldığında oyuncunun canını arttır
        document.addEventListener('keydown', canArttir);
    }

    function oyuncuyuHareketEttir(event) {
        if (!oyunBitti) {
            if (event.key === 'ArrowLeft') {
                solaHareketEt();
            } else if (event.key === 'ArrowRight') {
                sagaHareketEt();
            }
        }
    }

    function solaHareketEt() {
        let solPozisyon = parseInt(window.getComputedStyle(oyuncu).getPropertyValue('left'));
        if (solPozisyon > 0) {
            oyuncu.style.left = solPozisyon - 20 + 'px';
        }
    }

    function sagaHareketEt() {
        let solPozisyon = parseInt(window.getComputedStyle(oyuncu).getPropertyValue('left'));
        if (solPozisyon < oyunAlani.offsetWidth - oyuncu.offsetWidth) {
            oyuncu.style.left = solPozisyon + 20 + 'px';
        }
    }

    function engelOlustur() {
        const engel = document.createElement('div');
        engel.classList.add('engel');
        engel.style.left = Math.random() * (oyunAlani.offsetWidth - 20) + 'px';
        engel.style.top = '0'; // Engellerin yukarıdan başlaması için
        oyunAlani.appendChild(engel);
        engeller.push(engel);
    
        let engelInterval = setInterval(() => {
            let engelUst = parseInt(window.getComputedStyle(engel).getPropertyValue('top')); // Engellerin pozisyonunu al
            if (engelUst < oyunAlani.offsetHeight) { // Oyun alanının dışında değilse
                engel.style.top = engelUst + 20 + 'px'; // Engelleri aşağıya doğru hareket ettir
            } else { // Oyun alanının dışında ise
                if (!oyunBitti) {
                    oyunAlani.removeChild(engel); 
                    engeller.shift(); // İlk engeli kaldır
                    skor++; // Skoru arttır
                    skorGoster.innerText = 'Skor: ' + skor + ' En Yüksek Skor: ' + enYuksekSkor; // Skoru güncelle
                    // Hızı arttır
                    if (engelHizi > 2) { // Minimum hızı 2 olarak sınırla
                        engelHizi -= 2;
                    }
                    engelOlustur(); // Yeni bir engel oluştur
                }
                clearInterval(engelInterval);
            }
            if (carpismaKontrol(engel)) {
                if (oyuncuCan > 0 && oyuncu.style.visibility !== 'hidden') {
                    oyuncuCan--; 
                    canGoster.innerText = 'Can: ' + oyuncuCan; // Canı güncelle
                    engel.style.display = 'none'; // Çarpışmanın ardından engeli gizle
                    setTimeout(() => {
                        engel.style.display = 'block'; // Belirli bir süre sonra engeli yeniden göster
                    }, 1000); // Örneğin, 1 saniye sonra yeniden göster
                }
                if (oyuncuCan === 0) {
                    oyunuSonlandir();
                }
            }
        }, engelHizi); 
    }
    

    function carpismaKontrol(engel) {
        let oyuncuDikdortgen = oyuncu.getBoundingClientRect();
        let engelDikdortgen = engel.getBoundingClientRect();

        return !(
            oyuncuDikdortgen.bottom < engelDikdortgen.top ||
            oyuncuDikdortgen.top > engelDikdortgen.bottom ||
            oyuncuDikdortgen.right < engelDikdortgen.left ||
            oyuncuDikdortgen.left > engelDikdortgen.right
        );
    }

    function oyunuSonlandir() {
        oyunBitti = true;   
        // En yüksek skoru kontrol et ve gerekirse güncelle
        if (skor > enYuksekSkor) {
            enYuksekSkor = skor;
            localStorage.setItem('enYuksekSkor', enYuksekSkor); 
        }
        const oyunuYenidenBaslat = confirm('Oyun bitti! Skorunuz: ' + skor + '. En Yüksek Skor: ' + enYuksekSkor + '. Yeniden başlamak ister misiniz?');
        if (oyunuYenidenBaslat) {
            // Oyunu tekrar başlat
            oyunuSifirla();
        }
    }

    function canArttir(event) {
        if (!oyunBitti && event.key === 'q' && oyuncuCan < 2) {
            oyuncuCan++; 
            canGoster.innerText = 'Can: ' + oyuncuCan; // Canı güncelle
            // Can artışını kontrol etmek için zamanlayıcıyı başlat
            if (!canArtisTimer) {
                kalanCanArtisiSuresi = 10; // Can artışı için kalan süreyi ayarla
                kalanSureyiGuncelle();
                canArtisTimer = setInterval(() => {
                    kalanCanArtisiSuresi--; // Geriye doğru say
                    kalanSureyiGuncelle();
                    if (kalanCanArtisiSuresi === 0) {
                        clearInterval(canArtisTimer); // Zamanlayıcıyı durdur
                        canArtisTimer = null;
                    }
                }, 1000);
            }
        }
    }

    function oyuncuyuGorunmezYap(event) {
        if (!oyunBitti && event.key === ' ') {
            if (kalanGorunmezlikSuresi === 0 && gorunmezlikCooldown === 0) {
                oyuncu.style.visibility = 'hidden'; // Oyuncuyu görünmez yap
                kalanGorunmezlikSuresi = 3; // Görünmezlik süresini ayarla
                kalanSureyiGuncelle();
                const gorunmezlikInterval = setInterval(() => {
                    kalanGorunmezlikSuresi--; // Görünmezlik süresini geriye doğru say
                    kalanSureyiGuncelle();
                    if (kalanGorunmezlikSuresi === 0) {
                        clearInterval(gorunmezlikInterval); // Görünmezlik süresi dolduğunda interval'i durdur
                        oyuncu.style.visibility = 'visible'; // Oyuncuyu tekrar görünür yap
                        gorunmezlikCooldown = 20; // Görünmezlik bekleme süresini ayarla
                        kalanSureyiGuncelle();
                        const beklemeInterval = setInterval(() => {
                            if (gorunmezlikCooldown > 0) {
                                gorunmezlikCooldown--; // Görünmezlik bekleme süresini geriye doğru say
                                kalanSureyiGuncelle();
                            } else {
                                clearInterval(beklemeInterval); // Bekleme süresi dolduğunda interval'i durdur
                            }
                        }, 1000);
                    }
                }, 1000);
            }
        }
    }

    function engelHiziniArttir(event) {
        if (!oyunBitti && event.key === 'ArrowUp' && hizArtisSayisi < 3) {
            engelHizi -= 10; 
            hizArtisSayisi++; // Hız artış sayacını arttır
            kalanSureyiGuncelle(); 
        }
    }

    // Kalan süreleri ekranda göster
    function kalanSureyiGuncelle() {
        kalanSureGoster.innerText = 'Can Artışı Zamanı: ' + kalanCanArtisiSuresi + ' saniye\nGörünmezlik Süresi: ' + kalanGorunmezlikSuresi + ' saniye\nGörünmezlik Bekleme Süresi: ' + gorunmezlikCooldown + ' saniye\nHız Artış Sayısı: ' + hizArtisSayisi;
    }

    function oyunuSifirla() {
        skor = 0;
        skorGoster.innerText = 'Skor: ' + skor + ' En Yüksek Skor: ' + enYuksekSkor; // Skoru ve en yüksek skoru sıfırla
        oyunBitti = false;
        engelHizi = 100; // Hızı sıfırla
        oyuncuCan = 1; // Canı sıfırla
        canGoster.innerText = 'Can: ' + oyuncuCan; // Canı ekranda güncelle
        kalanCanArtisiSuresi = 0; // Can artışı için kalan süreyi sıfırla
        kalanGorunmezlikSuresi = 0; // Görünmezlik süresini sıfırla
        gorunmezlikCooldown = 0; // Görünmezlik bekleme süresini sıfırla
        hizArtisSayisi = 0; // Hız artış sayacını sıfırla
        // Oyuncuyu görünür yap
        oyuncu.style.visibility = 'visible';
        // Zamanlayıcıları sıfırla
        if (canArtisTimer) {
            clearInterval(canArtisTimer);
            canArtisTimer = null;
        }
        if (gorunurlukGuncellemeAraligi) {
            clearInterval(gorunurlukGuncellemeAraligi);
            gorunurlukGuncellemeAraligi = null;
        }
        
        oyunuBaslat();
        // Görünmezlik özelliğini sıfırla
        kalanGorunmezlikSuresi = 0;
        gorunmezlikCooldown = 0;
        hizArtisSayisi = 0;
        kalanSureyiGuncelle();
        
    }

    // Sayfa yenilendiğinde en yüksek skoru sıfırla
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('enYuksekSkor', enYuksekSkor); 
    });

    oyunuBaslat();
};
