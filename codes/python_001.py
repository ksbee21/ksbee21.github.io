import numpy as np
import matplotlib.pyplot as plt

def makeMeanValues(pointArray):
    return np.mean(pointArray)

def makeLinePoints(size=50,slope=2.0,intercept=5,startX=5,xStep=1,bias=2.0):
    xPoints = np.arange(startX, startX+xStep*size, xStep)
    yPoints = xPoints*slope+intercept+bias*(np.random.rand(size)-0.5)*2
    orgPoints = xPoints*slope+intercept
    return xPoints, yPoints, orgPoints

def makeSimpleLinearRegression(xPoints,yPoints):
    size = len(xPoints)
    if ( size != len(yPoints)):
        return
    
    xAvg = makeMeanValues(xPoints)
    yAvg = makeMeanValues(yPoints)
    slope = ((xPoints-xAvg)*(yPoints-yAvg)).sum() / ((xPoints-xAvg)**2).sum()
    intercept = yAvg - slope*xAvg
    return slope, intercept


size = 50
slope = 2.0
intercept = 5
startX = 10
xStep = 5
bias = 5.0

xyPoints = makeLinePoints(size,slope, intercept, startX, xStep, bias)
calcResult = makeSimpleLinearRegression(xyPoints[0], xyPoints[1])

orgStr = "[original y] = {slope}*x + {intercept}".format(slope=slope,intercept=intercept)
calcStr = "[regression y] = %0.4f*x + %0.4f" % (calcResult[0], calcResult[1])

plt.figure(figsize=(10,7))
plt.plot(xyPoints[0], xyPoints[2], color='g', label=orgStr)
plt.scatter(xyPoints[0], xyPoints[1], color='r', label='points')
plt.plot(xyPoints[0],xyPoints[0]*calcResult[0]+calcResult[1], color='b', label=calcStr)
plt.legend(fontsize=16)
plt.show()




