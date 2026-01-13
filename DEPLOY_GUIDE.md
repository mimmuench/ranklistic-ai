
# Ranklistic AI - Kurulum ve Deploy Rehberi

## Adım 1: Supabase Ayarları (Veritabanı)

1.  **Supabase Projesi Oluştur:** [database.new](https://database.new) adresine git.
2.  **SQL Kodlarını Çalıştır:** `SQL Editor` sekmesine git, aşağıdaki kodu yapıştır ve `RUN` butonuna bas:
    ```sql
    -- Tabloları oluşturur (Hata vermez)
    create extension if not exists "uuid-ossp";

    create table if not exists public.profiles (
      id uuid references auth.users on delete cascade not null primary key,
      email text,
      credits int default 5,
      plan text default 'free',
      is_subscribed boolean default false,
      created_at timestamp with time zone default timezone('utc'::text, now())
    );

    create table if not exists public.reports (
      id uuid default uuid_generate_v4() primary key,
      user_id uuid references auth.users on delete cascade not null,
      type text,
      title text,
      score numeric,
      data jsonb,
      created_at timestamp with time zone default timezone('utc'::text, now())
    );

    -- Yeni kullanıcı gelince otomatik profil oluşturan fonksiyon
    create or replace function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public.profiles (id, email, credits, plan)
      values (new.id, new.email, 5, 'free')
      on conflict (id) do nothing;
      return new;
    end;
    $$ language plpgsql security definer;

    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    ```
3.  **API Keyleri Al:**
    *   Supabase panelinde: `Settings` (Dişli ikonu) -> `API` kısmına git.
    *   **Project URL** ve **anon public** key'lerini kopyala.

---

## Adım 2: Vercel Deploy (Canlıya Alma)

Bu projeyi Vercel'e deploy etmek çok basittir.

### Yöntem A: Vercel CLI (Komut Satırı - Önerilen)
Terminali aç ve sırasıyla şunları yaz:

1.  `npm install -g vercel` (Eğer yüklü değilse)
2.  `vercel login` (Vercel hesabına giriş yap)
3.  `vercel` (Enter, Enter, Enter... varsayılanları kabul et)

### Yöntem B: Git Entegrasyonu
Kodlarını GitHub'a pushladıysan, Vercel panelinden "Import Project" diyerek reponu seçebilirsin.

---

## Adım 3: Environment Variables (Çevre Değişkenleri)

Uygulamanın çalışması için bu ayarları yapman **ŞARTTIR**.

### Vercel Üzerinde:
1.  Vercel Dashboard'da projene gir.
2.  **Settings** -> **Environment Variables** sekmesine git.
3.  Aşağıdaki değişkenleri tek tek ekle:

| Key | Value (Değer) |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase'den aldığın Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase'den aldığın anon public key |
| `API_KEY` | Google Gemini API Key |

4.  **Redeploy:** Değişkenleri ekledikten sonra `Deployments` sekmesine gidip son deploy'un yanındaki üç noktaya tıkla ve **"Redeploy"** de.

### Lokal Çalışma (.env Dosyası):
Bilgisayarında çalışırken projenin ana dizininde `.env` isimli bir dosya oluştur ve içini doldur:

```env
API_KEY=AIzaSy...
VITE_SUPABASE_URL=https://xyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxh...
```

**Not:** `.env` dosyasını asla GitHub'a yükleme!
