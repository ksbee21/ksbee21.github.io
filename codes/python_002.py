import requests
import json

path = 'https://resources.oreilly.com/examples/0636920023784/-/raw/master/pydata-book-master/ch02/usagov_bitly_data2012-03-16-1331923249.txt'

res = requests.get(path)
jsonStr = res.text

#print(jsonStr)

#jsonObj = [json.loads(line) for line in jsonStr.split('\n')]
#jsonObj  = json.loads(jsonStr)
jsonListObj = []
for line in jsonStr.strip().split('\n'):
    lv = json.loads(line)
    #print(lv)
    jsonListObj.append(lv)


print(jsonListObj)
print(len(jsonListObj))


print(jsonListObj[34]['hc'])