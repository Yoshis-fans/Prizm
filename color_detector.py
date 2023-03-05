import cv2
import base64
from io import BytesIO
import numpy as np
import pandas as pd
import argparse
from PIL import Image
from colorthief import ColorThief


class ColorDetector():

    index = ["RAL", "RGB", "HEX", "English"]
    csv = pd.read_csv('colors.csv', names=index, header=None)

    index2 = ["NAME", "HEX", "Red", "Green", "Blue"]
    csvGeneral = pd.read_csv('thing.csv', names=index2, header=None)

    def __init__(self, img, x=0, y=0):
        self.img = img[23:]  # img received in base64 format
        self.x = x  # x and y coordinates of click
        self.y = y

        self.rgb = (0, 0, 0)

        im_bytes = base64.b64decode(self.img)  # convert to binary image
        im_file = BytesIO(im_bytes)  # convert image to file.like object
        self.pil_image = Image.open(im_file)  # now PIL image object
        self.size_image = self.pil_image.size
        # self.pil_image = Image.open(BytesIO(base64.b64decode(self.img)))

        im_arr = np.frombuffer(im_bytes, dtype=np.uint8)  # a 1-d numpy array
        self.cv2_image = cv2.imdecode(
            im_arr, flags=cv2.IMREAD_COLOR)  # opencv image
        r = 15  # half of the length of the surrounding box
        
        surrounding_sq = (x-r, y-r, x+r, y+r)
        
        # surrounding_sq = (
        #     x-r if x-r>0 else 0, 
        #     y-r if y-r>0 else 0, 
        #     x+r if x+r<self.size_image[0] else self.size_image[0], 
        #     y+r if y+r<self.size_image[1] else self.size_image[1]
        #     )

        self.surrounding_img = self.pil_image.crop(surrounding_sq)
        self.surrounding_img.save('surrounding_img.jpg')

    def get_clicked_pixel_rgb(self):
        b, g, r = self.cv2_image[self.y, self.x]
        b = int(b)
        g = int(g)
        r = int(r)

        rgb_pixel = (r, g, b)
        return rgb_pixel

    def get_dominant_surrounding_rgb(self):
        color_thief = ColorThief('surrounding_img.jpg')

        # this is a tuple of (r, g, b)
        dominant_bg_color = color_thief.get_color(quality=1)

        return dominant_bg_color

    def get_color_name(self, R, G, B):
        minimum = 10000
        minimum2 = 10000
        for i in range(1, len(self.csv)):

            rgb = self.csv.loc[i, "RGB"].split("-")
            # print(rgb)
            d = abs(R - int(rgb[0])) + \
                abs(G - int(rgb[1])) + abs(B - int(rgb[2]))
            # print(d)
            if (d <= minimum):
                minimum = d
                cname = self.csv.loc[i, "English"]
                chex = self.csv.loc[i, "HEX"]

        for i in range(1, len(self.csvGeneral)):
            Red = self.csvGeneral.loc[i, "Red"]
            Green = self.csvGeneral.loc[i, "Green"]
            Blue = self.csvGeneral.loc[i, "Blue"]

            e = abs(R - int(Red)) + \
                abs(G - int(Green)) + abs(B - int(Blue))
            if (e <= minimum2):
                minimum2 = e
                gen_name = self.csvGeneral.loc[i, "NAME"]
                gen_hex = self.csvGeneral.loc[i, "HEX"]
        return (chex, cname, gen_hex, gen_name)

    def pixel_color_caller(self):
        clicked_rgb_tuple = self.get_clicked_pixel_rgb()
        color_name = self.get_color_name(
            clicked_rgb_tuple[0], clicked_rgb_tuple[1], clicked_rgb_tuple[2])

        return [color_name, clicked_rgb_tuple]

    def background_color_caller(self):
        bg_color_tuple = self.get_dominant_surrounding_rgb()
        color_info = self.get_color_name(
            bg_color_tuple[0], bg_color_tuple[1], bg_color_tuple[2])

        res = {
            "dominantColorHex": color_info[0],
            "dominantColorName": color_info[1],
            "generalColorHex": color_info[2],
            "generalColorName": color_info[3],
            "imageSize": self.size_image

        }
        return res


if __name__ == "__main__":
    with open("bw.png", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())

    img_text = input()

    print("Passed encoding stage")
    colorblind = ColorDetector(img_text, 150, 100)
    print("Passed initialization stage")
    # pixel_color = colorblind.pixel_color_caller()
    # print(pixel_color)
    print("Got pixel color")
    surrounding_color = colorblind.background_color_caller()
    print("Didd we get surrounding color")

    print(surrounding_color)

    print("end")
