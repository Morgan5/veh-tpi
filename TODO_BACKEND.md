# ✅ TODO Backend Django pour Intégration Complète

## Ce que le Frontend attend du Backend

---

## 🗄️ Modèles MongoDB à Créer/Modifier

### 1. Nouveau Modèle: `Asset`

```python
# models.py
from mongoengine import Document, StringField, DateTimeField, DictField, ReferenceField
from datetime import datetime

class Asset(Document):
    """
    Modèle pour les assets (images et sons)
    """
    type = StringField(required=True, choices=['image', 'sound'])
    name = StringField(required=True, max_length=255)
    url = StringField(required=True)  # URL du fichier stocké
    metadata = DictField()  # {size, mimeType, aiGenerated, prompt, model, etc.}
    uploaded_by = ReferenceField('User', required=True)
    created_at = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'assets',
        'indexes': [
            'type',
            'uploaded_by',
            '-created_at'
        ]
    }
```

### 2. Modifier Modèle: `Scene`

```python
# models.py
class Scene(Document):
    scenario_id = ReferenceField('Scenario', required=True)
    title = StringField(required=True)
    text = StringField(required=True)  # Changé de 'content' à 'text'
    
    # NOUVEAUX CHAMPS
    image_id = ReferenceField('Asset', null=True)  # Référence à Asset type='image'
    sound_id = ReferenceField('Asset', null=True)  # Référence à Asset type='sound'
    
    position = DictField()  # {x: int, y: int}
    is_start_scene = BooleanField(default=False)
    choices = ListField(ReferenceField('Choice'))
```

### 3. Modifier Modèle: `Choice`

```python
# models.py
class Choice(Document):
    from_scene_id = ReferenceField('Scene', required=True)  # Changé de 'scene_id'
    to_scene_id = ReferenceField('Scene', required=True)    # Changé de 'target_scene_id'
    text = StringField(required=True)
    condition = StringField(null=True)  # Expression conditionnelle
```

---

## 🔌 Schémas GraphQL à Ajouter

### 1. Type Asset

```python
# schema.py
import graphene
from graphene_mongo import MongoengineObjectType

class AssetType(MongoengineObjectType):
    class Meta:
        model = Asset
        
    id = graphene.String()
    type = graphene.String()
    name = graphene.String()
    url = graphene.String()
    metadata = graphene.JSONString()
    uploaded_by = graphene.String()
    created_at = graphene.DateTime()
```

### 2. Queries pour Assets

```python
class Query(graphene.ObjectType):
    # ... existing queries
    
    # Récupérer tous les assets (avec filtre optionnel par type)
    assets = graphene.List(
        AssetType,
        type=graphene.String()  # Optionnel: 'image' ou 'sound'
    )
    
    # Récupérer un asset spécifique
    asset = graphene.Field(
        AssetType,
        id=graphene.String(required=True)
    )
    
    def resolve_assets(self, info, type=None):
        query = Asset.objects.all()
        if type:
            query = query.filter(type=type)
        return query.order_by('-created_at')
    
    def resolve_asset(self, info, id):
        return Asset.objects.get(id=id)
```

### 3. Mutations pour Assets

```python
from graphene_file_upload.scalars import Upload

class UploadAsset(graphene.Mutation):
    """
    Upload un fichier (image ou son) et créer un Asset
    """
    class Arguments:
        file = Upload(required=True)
        type = graphene.String(required=True)
        name = graphene.String(required=True)
    
    asset = graphene.Field(AssetType)
    
    def mutate(self, info, file, type, name):
        user = info.context.user  # Utilisateur authentifié
        
        # Validation
        if type not in ['image', 'sound']:
            raise Exception('Type invalide')
        
        # Upload du fichier vers stockage (S3, Cloudinary, ou local)
        file_url = upload_file_to_storage(file, type)
        
        # Créer l'Asset
        asset = Asset(
            type=type,
            name=name,
            url=file_url,
            uploaded_by=user,
            metadata={
                'size': file.size,
                'mimeType': file.content_type,
                'originalName': file.name
            }
        )
        asset.save()
        
        return UploadAsset(asset=asset)


class GenerateImageWithAI(graphene.Mutation):
    """
    Générer une image avec IA (Hugging Face)
    """
    class Arguments:
        prompt = graphene.String(required=True)
    
    asset = graphene.Field(AssetType)
    
    def mutate(self, info, prompt):
        import requests
        from django.conf import settings
        
        user = info.context.user
        
        # Appel API Hugging Face
        API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"
        headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}
        
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": prompt, "options": {"wait_for_model": True}}
        )
        
        if response.status_code != 200:
            raise Exception(f"Erreur Hugging Face: {response.text}")
        
        # Sauvegarder l'image générée
        image_blob = response.content
        file_url = save_blob_to_storage(image_blob, 'ai-generated-image.png', 'image')
        
        # Créer l'Asset
        asset = Asset(
            type='image',
            name=f"AI Generated: {prompt[:30]}...",
            url=file_url,
            uploaded_by=user,
            metadata={
                'aiGenerated': True,
                'prompt': prompt,
                'model': 'stable-diffusion-2-1',
                'size': len(image_blob)
            }
        )
        asset.save()
        
        return GenerateImageWithAI(asset=asset)


class GenerateSoundWithAI(graphene.Mutation):
    """
    Générer un son/musique avec IA (PlayHT ou Coqui TTS)
    """
    class Arguments:
        prompt = graphene.String(required=True)
    
    asset = graphene.Field(AssetType)
    
    def mutate(self, info, prompt):
        # TODO: Implémenter avec PlayHT ou Coqui TTS
        # Similaire à GenerateImageWithAI
        pass


class DeleteAsset(graphene.Mutation):
    """
    Supprimer un asset
    """
    class Arguments:
        id = graphene.String(required=True)
    
    success = graphene.Boolean()
    
    def mutate(self, info, id):
        asset = Asset.objects.get(id=id)
        
        # Optionnel: Supprimer le fichier du stockage
        delete_file_from_storage(asset.url)
        
        asset.delete()
        return DeleteAsset(success=True)


# Ajouter à la classe Mutation
class Mutation(graphene.ObjectType):
    # ... existing mutations
    upload_asset = UploadAsset.Field()
    generate_image_with_ai = GenerateImageWithAI.Field()
    generate_sound_with_ai = GenerateSoundWithAI.Field()
    delete_asset = DeleteAsset.Field()
```

---

## 📦 Fonctions Utilitaires à Créer

### 1. Upload vers Storage

```python
# utils/storage.py

def upload_file_to_storage(file, asset_type):
    """
    Upload un fichier vers le stockage configuré
    Retourne l'URL du fichier
    """
    storage_type = settings.STORAGE_TYPE  # 'local', 's3', 'cloudinary'
    
    if storage_type == 's3':
        return upload_to_s3(file, asset_type)
    elif storage_type == 'cloudinary':
        return upload_to_cloudinary(file, asset_type)
    else:
        return upload_to_local(file, asset_type)


def upload_to_s3(file, asset_type):
    """Upload vers AWS S3"""
    import boto3
    from django.conf import settings
    
    s3 = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    
    file_name = f"{asset_type}/{uuid.uuid4()}_{file.name}"
    
    s3.upload_fileobj(
        file,
        settings.AWS_BUCKET_NAME,
        file_name,
        ExtraArgs={'ACL': 'public-read'}
    )
    
    return f"https://{settings.AWS_BUCKET_NAME}.s3.amazonaws.com/{file_name}"


def upload_to_cloudinary(file, asset_type):
    """Upload vers Cloudinary"""
    import cloudinary.uploader
    
    result = cloudinary.uploader.upload(
        file,
        folder=f"story-app/{asset_type}",
        resource_type='auto'
    )
    
    return result['secure_url']


def upload_to_local(file, asset_type):
    """Upload en local (dev uniquement)"""
    from django.core.files.storage import default_storage
    import uuid
    
    file_name = f"{asset_type}/{uuid.uuid4()}_{file.name}"
    path = default_storage.save(file_name, file)
    
    return f"{settings.MEDIA_URL}{path}"


def save_blob_to_storage(blob_data, filename, asset_type):
    """Sauvegarder des données binaires (pour IA)"""
    from io import BytesIO
    from django.core.files.uploadedfile import InMemoryUploadedFile
    
    file_obj = InMemoryUploadedFile(
        BytesIO(blob_data),
        None,
        filename,
        'image/png',
        len(blob_data),
        None
    )
    
    return upload_file_to_storage(file_obj, asset_type)
```

---

## ⚙️ Configuration Django

### 1. Settings

```python
# settings.py

# Storage Configuration
STORAGE_TYPE = os.getenv('STORAGE_TYPE', 'local')  # 'local', 's3', 'cloudinary'

# AWS S3
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_BUCKET_NAME = os.getenv('AWS_BUCKET_NAME')
AWS_REGION = os.getenv('AWS_REGION', 'eu-west-1')

# Cloudinary
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

# AI APIs
HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
PLAYHT_API_KEY = os.getenv('PLAYHT_API_KEY')

# Media files (si stockage local)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# File upload settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
```

### 2. Requirements

```txt
# requirements.txt (ajouter)
graphene-file-upload==1.3.0
boto3==1.26.0  # Pour S3
cloudinary==1.30.0  # Pour Cloudinary
Pillow==9.5.0  # Pour traitement d'images
requests==2.28.0  # Pour API Hugging Face
```

### 3. URLs

```python
# urls.py
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... existing patterns
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

---

## 🔒 Validation et Sécurité

### 1. Validateurs

```python
# validators.py
from django.core.exceptions import ValidationError

def validate_file_size(file):
    """Max 5MB pour images, 10MB pour sons"""
    max_size = 5 * 1024 * 1024  # 5MB
    if file.size > max_size:
        raise ValidationError(f'Fichier trop volumineux: {file.size} bytes')

def validate_image_extension(file):
    """Seulement JPG, PNG, GIF, WEBP"""
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in valid_extensions:
        raise ValidationError(f'Extension invalide: {ext}')

def validate_sound_extension(file):
    """Seulement MP3, WAV, OGG"""
    valid_extensions = ['.mp3', '.wav', '.ogg']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in valid_extensions:
        raise ValidationError(f'Extension invalide: {ext}')
```

### 2. Permissions

```python
# permissions.py
def check_asset_ownership(user, asset):
    """Vérifier que l'utilisateur peut modifier/supprimer l'asset"""
    if asset.uploaded_by != user and not user.is_admin:
        raise PermissionError('Vous n\'êtes pas autorisé à modifier cet asset')
```

---

## 🧪 Tests à Créer

```python
# tests/test_assets.py
from django.test import TestCase

class AssetTestCase(TestCase):
    def test_create_asset(self):
        """Test création d'asset"""
        pass
    
    def test_upload_image(self):
        """Test upload d'image"""
        pass
    
    def test_generate_image_ai(self):
        """Test génération IA"""
        pass
    
    def test_delete_asset(self):
        """Test suppression"""
        pass
    
    def test_file_too_large(self):
        """Test fichier trop volumineux"""
        pass
```

---

## 📋 Checklist d'Implémentation

### Phase 1: Modèles
- [ ] Créer modèle `Asset`
- [ ] Modifier modèle `Scene` (ajouter `image_id`, `sound_id`)
- [ ] Modifier modèle `Choice` (renommer en `from_scene_id`, `to_scene_id`)
- [ ] Créer migrations MongoDB

### Phase 2: Storage
- [ ] Implémenter `upload_file_to_storage()`
- [ ] Configurer stockage (S3, Cloudinary, ou local)
- [ ] Tester upload de fichiers

### Phase 3: GraphQL
- [ ] Créer `AssetType` GraphQL
- [ ] Implémenter query `assets`
- [ ] Implémenter mutation `uploadAsset`
- [ ] Implémenter mutation `deleteAsset`

### Phase 4: IA
- [ ] Configurer clé API Hugging Face
- [ ] Implémenter `generateImageWithAI`
- [ ] Tester génération d'images
- [ ] (Optionnel) Implémenter `generateSoundWithAI`

### Phase 5: Sécurité
- [ ] Ajouter validateurs de fichiers
- [ ] Implémenter permissions
- [ ] Ajouter rate limiting sur IA

### Phase 6: Tests
- [ ] Tests unitaires modèles
- [ ] Tests mutations GraphQL
- [ ] Tests upload
- [ ] Tests génération IA

---

## 🔗 Endpoints Attendus

Le frontend s'attend à ces endpoints GraphQL :

```graphql
# Queries
query {
  assets(type: "image") { ... }
  asset(id: "123") { ... }
}

# Mutations
mutation {
  uploadAsset(file: ..., type: "image", name: "...") { ... }
  generateImageWithAI(prompt: "...") { ... }
  generateSoundWithAI(prompt: "...") { ... }
  deleteAsset(id: "123") { ... }
}
```

---

Une fois tout implémenté, le frontend sera **100% fonctionnel** ! 🚀

