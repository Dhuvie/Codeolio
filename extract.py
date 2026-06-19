import cv2
import os

video_path = "A_seamless_continuous_slow_f.mp4"
output_dir = "public/frames"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

cap = cv2.VideoCapture(video_path)
count = 1

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
        
    output_path = os.path.join(output_dir, f"frame_{count:04d}.jpg")
    cv2.imwrite(output_path, frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
    count += 1

cap.release()
print(f"Extracted {count - 1} frames.")
