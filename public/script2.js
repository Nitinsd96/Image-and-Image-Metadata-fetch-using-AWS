var albumBucketName = "nitininbucket";
var bucketRegion = "ap-south-1";
var IdentityPoolId = "ap-south-1:885aa03a-57fe-4478-8322-d984cca56423";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  }),
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

function addPhoto() {
  var files = document.getElementById("photoupload").files;
  if (!files.length) {
    return alert("Please choose a file to upload first.");
  }
  var file = files[0];
  var fileName = file.name;

  // Use S3 ManagedUpload class as it supports multipart uploads
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: albumBucketName,
      Key: fileName,
      Body: file,
      ACL: "public-read",
    },
  });
  var promise = upload.promise();

  promise.then(
    function (data) {
      alert("Successfully uploaded photo.");
      viewAlbum(albumName);
    },
    function (err) {
      return alert("There was an error uploading your photo: ", err.message);
    }
  );
}

function ViewPhotos() {
  s3.listObjects({ Delimiter: "/" }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    } else {
      console.log("output View photos :", data);
      var photos = data.Contents.map(function (photo) {
        var photoKey = photo.Key;
        console.log("photo data : ", photo);

        // 'this' references the AWS.Response instance that represents the response

        var photoUrl =
          "https://s3." +
          bucketRegion +
          ".amazonaws.com/" +
          albumBucketName +
          "/" +
          photoKey;

        document.getElementById("app").innerHTML += getHtml([
          "<span>",
          "<div id='" + photoKey + "'>",
          '<img style="width:400px;height:400px;" id=' +
            photoKey +
            'image src="' +
            photoUrl +
            '"/>',
          "</div>",
          "</span>",
        ]);
        getAttrubutes(photoUrl, photoKey);
        
      });
    }
  });
}

function getAttrubutes(opts, photoKey) {
  fetch("/getAttributes", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: opts }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("data", data);
      
let stringss=JSONToTable(data);
console.log("strings",stringss)
      document.getElementById(photoKey).innerHTML += stringss;
    });
}

function JSONToTable( data ) {
  if (typeof data === "boolean") return `${JSON.stringify(data)}`;
  if (!data) return "null";
  if (typeof data !== "object") {
    return data;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    // eslint-disable-next-line no-unused-vars
    let header = null;
    if (typeof data[0] !== "object") {
      let temp=`<table border={1} style={{ textAlign: "top" }}>
      <tbody>`
      data.forEach((item,index)=>{
        temp+=`<tr>
        <td>${index + 1}</td>
        <td>
          ${JSONToTable(item)}
        </td>
      </tr>`
      })
      temp+=`</tbody>
      </table>`
      return (
        temp
      );
    }
    header = Object.keys(data[0]);
    let temp3=``;
    data.forEach((item)=>{
      temp3+=JSONToTable(item)
    })
    return (
      temp3
    );
  }
  const keys = Object.keys(data);

  let temp2= 
  `<table border={1} style={{ textAlign: "top" }}>
    <tbody>`;
    keys.map(item => {
      temp2+=`<tr key={item}>
        <td>${item}</td>
        <td>
        ${JSONToTable(data[item])}
        </td>
      </tr>`
    })
    temp2+=` </tbody>
    </table>`
  return (
    
      temp2 );
}