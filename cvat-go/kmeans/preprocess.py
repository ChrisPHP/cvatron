# This is a sample Python script.
import cv2
import matplotlib.pyplot as plt, mpld3
from matplotlib import colors
import numpy as np
from kmeans_pytorch import kmeans
import torch
import sys
#from bitarray.util import ba2int
#from bitarray import bitarray
from torchvision import transforms
import os

# Press Shift+F10 to execute it or replace it with your code.
# Press Double Shift to search everywhere for classes, files, tool windows, actions, and settings.


def show_scatter(hsv_nemo):
    pixel_colors = hsv_nemo.reshape((np.shape(hsv_nemo)[0] * np.shape(hsv_nemo)[1], 3))
    norm = colors.Normalize(vmin=-1., vmax=1.)
    norm.autoscale(pixel_colors)
    pixel_colors = norm(pixel_colors).tolist()

    h, s, v = cv2.split(hsv_nemo)
    fig = plt.figure()
    axis = fig.add_subplot(1, 1, 1, projection="3d")

    axis.scatter(h.flatten(), s.flatten(), v.flatten(), facecolors=pixel_colors, marker=".")
    axis.set_xlabel("Hue")
    axis.set_ylabel("Saturation")
    axis.set_zlabel("Value")
    plt.show()

def select_green(image,cls_image,num_clusters):
    # every_green
    green_cls=list()
    #light_green = (45, 0,0)
    #dark_green = (90, 255, 255)

    # crop_green
    light_green = (70, 40, 40)
    dark_green = (90, 255, 255)

    cls_image+=1
    a=np.copy(image)
    image = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    mask = cv2.inRange(image, light_green, dark_green)
    imask=mask>0
    imask=1*imask
    sel_class=cls_image*imask
    sel_class=1*sel_class
    plt.imshow(image)
    return sel_class







def print_hi(name, arg, arg2):
    # Use a breakpoint in the code line below to debug your script.


    #file_path="../../detectron2/vgw_data/training_set/all_443/new_sel/selected_images/cos/selected/" + file_name
    #file_path = "./images/" + file_name
    #file_path = "./" + file_name
    #h,t=os.path.split(file_path)
    #file_path_org=h +"/"+ t[:-6]+".png"
    #cos="cos_23176.png"
    file_path =  "./static/reflect/" + arg
    file_org = "./static/" + arg
    image = cv2.imread(file_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


    nemo = cv2.imread(file_path, cv2.COLOR_BGR2RGB)
    #org = cv2.imread(file_path_org, cv2.COLOR_BGR2RGB)
    hsv_nemo = np.asarray(cv2.cvtColor(nemo, cv2.COLOR_BGR2HSV))
    yuv_nemo = np.asarray(cv2.cvtColor(nemo, cv2.COLOR_BGR2YUV))

    light_green = (15, 0, 0)
    dark_green = (40, 255, 255)

    #light_green = (60, 60, 60)
    #dark_green = (80, 255, 255)

    mask = cv2.inRange(hsv_nemo, light_green, dark_green)



    a = cv2.bitwise_and(nemo, nemo, mask=mask)
    img_huv=np.zeros((nemo.shape[0],nemo.shape[1],3))
    img_huv[:, :, 0] = hsv_nemo[:, :, 0]
    img_huv[:, :, 1] = yuv_nemo[:, :, 1]
    img_huv[:, :, 2] = yuv_nemo[:, :, 2]

    img_huv=cv2.merge([img_huv[:,:,0],img_huv[:,:,1],img_huv[:,:,2]])
    hsv_nemo=img_huv

    hsv_nemo = hsv_nemo.reshape(nemo.shape[0]*nemo.shape[1],3)
    x = torch.from_numpy(hsv_nemo)

    image = np.asarray(cv2.cvtColor(image, cv2.COLOR_BGR2HSV))
    image = image.reshape(image.shape[0]*image.shape[1],3)
    y = torch.from_numpy(image)

    num_clusters=int(arg2)

    for index in range(num_clusters):
        selected = torch.nonzero(torch.tensor([4]) == index).squeeze().to(0)

    cluster_ids_x, cluster_centers = kmeans(
       X=y, num_clusters=num_clusters, distance='cosine', device=torch.device('cuda:0')
     )


    x=np.asarray(cluster_ids_x)
    x = x.reshape(nemo.shape[0],nemo.shape[1])
    imc = x.astype(np.uint8)

    green_cls=select_green(nemo, x, num_clusters)
    unique_cls=np.unique(green_cls)
    a=np.zeros_like(x)
    for i in unique_cls:
        a+=i*(x==i)



    a=255*(a>0)
    a=np.asarray(a,dtype="uint8")
    a = cv2.Canny(a, a.shape[0], a.shape[1])
    #cv2.imwrite("./scribble.png", a)
    plt.subplot(2, 2, 1)
    plt.imshow(nemo)
    plt.imsave("./static/process/c-" + arg, x)
    #cv2.imwrite("./static/process/c-" + arg, x)
    plt.colorbar()
    plt.title("Original Image", fontsize='medium')
    plt.subplot(2, 2, 2)
    #plt.imshow(x)
    #plt.imsave("./static/process/" + arg, nemo)
    #cv2.imwrite("./static/process/" + arg, nemo)

    plt.title("Reflectance Image", fontsize='medium')
    plt.colorbar()
    plt.subplot(2, 2, 3)
    plt.imshow(x, cmap='jet')



    #imc = cv2.applyColorMap(imc, cv2.COLORMAP_JET)
    #cv2.imwrite("./static/process/r-" + arg, imc)
    plt.imsave("./static/process/r-" + arg, x, cmap='jet')

    plt.colorbar()
    plt.title("Classified Image " + '['+str(num_clusters)+']', fontsize='medium')
    plt.subplot(2, 2, 4)
    #test=select_green(nemo, x, num_clusters)
    plt.imshow(green_cls,cmap='jet')

    #imc = green_cls.astype(np.uint8)
    #imc = cv2.applyColorMap(imc, cv2.COLORMAP_JET)
    #print(green_cls)
    #cv2.imwrite("./static/process/g-" + arg, green_cls)
    plt.imsave("./static/process/g-" + arg, green_cls)
    plt.colorbar()
    plt.title("classes capturing green " + '['+str(len(unique_cls)-2)+']', fontsize='medium')

    fig = plt.gcf()
    mpld3.save_html(fig, "./static/process/test.html")

    #plt.show()
    reduced_cls = np.ones_like(x, np.uint8)
    for i in range(num_clusters):
        if i in green_cls:
            reduced_cls[x==i]=1*x[x==i]

    plt.imshow(reduced_cls)
    return

    plt.subplot(1, 2, 1)
    plt.imshow(nemo)
    plt.subplot(1, 2, 2)
    plt.imshow(x==0)
    plt.show()

    # crop_green (celery)
    light_green = (40, 0, 0)
    dark_green = (60, 255, 255)


    for i in range(num_clusters):

        mask = (hsv_nemo == 2)
        mask = cv2.inRange(result, light_green, dark_green)
        result = cv2.bitwise_and(nemo, nemo, mask=mask)



        plt.subplot(1, 2, 1)
        plt.imshow(nemo)
        plt.subplot(1, 2, 2)
        plt.imshow(result)
        plt.show()



    print(f'Hi, {name}')  # Press Ctrl+F8 to toggle the breakpoint.


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    arg = sys.argv[1]
    arg2 = sys.argv[2]
    print_hi('PyCharm', arg, arg2)

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
