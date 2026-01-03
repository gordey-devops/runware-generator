"""
Runware SDK Proof of Concept Test
Tests basic image generation functionality with the Runware API.
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from runware import Runware, IImageInference

# Fix encoding for Windows console
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load environment variables
load_dotenv()

async def test_text_to_image():
    """Test basic text-to-image generation."""
    print("🔄 Initializing Runware client...")
    
    api_key = os.getenv("RUNWARE_API_KEY")
    if not api_key:
        print("❌ RUNWARE_API_KEY not found in .env file")
        return
    
    try:
        # Initialize Runware client
        runware = Runware(api_key=api_key)
        await runware.connect()
        print("✅ Connected to Runware API")
        
        # Test 1: Simple text-to-image generation
        print("\n🎨 Test 1: Generating image from text prompt...")
        
        request_image = IImageInference(
            positivePrompt="A beautiful sunset over mountains, digital art, vibrant colors",
            model="runware:100@1",
            numberResults=1,
            height=512,
            width=512,
            steps=20,
            CFGScale=7.5,
        )
        
        images = await runware.imageInference(requestImage=request_image)
        
        if images:
            print(f"✅ Generated {len(images)} image(s)")
            for i, image in enumerate(images):
                print(f"\n📸 Image {i+1}:")
                print(f"   URL: {image.imageURL}")
                if hasattr(image, 'seed'):
                    print(f"   Seed: {image.seed}")
                
                # Save image info
                output_dir = Path("generated")
                output_dir.mkdir(exist_ok=True)
                
                with open(output_dir / f"test_image_{i+1}.txt", "w") as f:
                    f.write(f"Image URL: {image.imageURL}\n")
                    if hasattr(image, 'seed'):
                        f.write(f"Seed: {image.seed}\n")
                    f.write(f"Prompt: A beautiful sunset over mountains, digital art, vibrant colors\n")
                
                print(f"   ℹ️  Info saved to: generated/test_image_{i+1}.txt")
        else:
            print("❌ No images generated")
        
        # Test 2: Different parameters
        print("\n🎨 Test 2: Testing different parameters...")
        
        request_image_2 = IImageInference(
            positivePrompt="A futuristic city at night, cyberpunk style, neon lights",
            negativePrompt="blurry, low quality, distorted",
            model="runware:100@1",
            numberResults=1,
            height=768,
            width=512,
            steps=25,
            CFGScale=8.0,
            seed=42,  # Fixed seed for reproducibility
        )
        
        images_2 = await runware.imageInference(requestImage=request_image_2)
        
        if images_2:
            print(f"✅ Generated {len(images_2)} image(s) with custom parameters")
            for i, image in enumerate(images_2):
                print(f"\n📸 Image {i+1}:")
                print(f"   URL: {image.imageURL}")
                print(f"   Used seed: 42 (for reproducibility)")
        
        print("\n" + "="*50)
        print("🎉 All tests completed successfully!")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ Error occurred: {type(e).__name__}")
        print(f"   Message: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        try:
            await runware.close()
            print("\n✅ Connection closed")
        except:
            pass

async def test_sdk_features():
    """Test and document available SDK features."""
    print("\n" + "="*50)
    print("📋 Runware SDK Feature Detection")
    print("="*50)
    
    api_key = os.getenv("RUNWARE_API_KEY")
    if not api_key:
        print("❌ RUNWARE_API_KEY not found")
        return
    
    try:
        runware = Runware(api_key=api_key)
        await runware.connect()
        
        # Check available methods
        print("\n🔍 Available Runware methods:")
        methods = [method for method in dir(runware) if not method.startswith('_')]
        for method in methods:
            print(f"   - {method}")
        
        # Document IImageInference parameters
        print("\n📝 IImageInference available parameters:")
        from inspect import signature
        sig = signature(IImageInference)
        for param_name, param in sig.parameters.items():
            print(f"   - {param_name}: {param.annotation if param.annotation != param.empty else 'Any'}")
        
        await runware.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

async def main():
    """Main test function."""
    print("="*50)
    print("🚀 Runware SDK Proof of Concept")
    print("="*50)
    print()
    
    # Run main tests
    await test_text_to_image()
    
    # Document features
    await test_sdk_features()
    
    print("\n✨ Testing complete! Check 'generated/' folder for results.")

if __name__ == "__main__":
    asyncio.run(main())
