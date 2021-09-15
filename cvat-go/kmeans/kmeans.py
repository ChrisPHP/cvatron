import cv2
import numpy as np
import matplotlib.pyplot as plt
from kmeans_pytorch import kmeans
import torch
import sys

arg = sys.argv[1]
#arg = './Test.png'
print(arg)

#print(os.getcwd())

image = cv2.imread('./static/process/' + arg)
image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)


pixel_values = image.reshape((-1, 3))
pixel_values = np.float32(pixel_values)
pixel_values = torch.tensor(pixel_values)

#plt.imshow(image)
#plt.show()

K = 20

cluster_ids_x,cluster_centers = kmeans(
    X=pixel_values, num_clusters=K, distance='cosine', device=torch.device('cuda:0')
)

labels=np.asarray(cluster_ids_x)
lab_img = labels.reshape([image.shape[0], image.shape[1]])

#plt.imshow(lab_img, cmap='jet')
#plt.show()

#cv2.imwrite("./" + arg, lab_img)
plt.imsave("./" + arg, lab_img)
#plt.imshow(lab_img)
#plt.show()

#criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)


#_, labels, (centers) = cv2.kmeans(pixel_values, K, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

#lab_img = labels.reshape([image.shape[0], image.shape[1]])


#centers = np.uint8(centers)

#labels = labels.flatten()

#seg_img = centers[labels.flatten()]

#seg_img = seg_img.reshape(image.shape)

#masked_image = np.copy(image)
#masked_image = masked_image.reshape((-1,3))

#cluster = 2

#masked_image[labels == cluster] = [0,0,0]

#masked_image = masked_image.reshape(image.shape)

#plt.imshow(seg_img)
#plt.show()

#cv2.imwrite("./" + arg, lab_img)
