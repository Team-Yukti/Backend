const express = require('express');
const router = express.Router();
var admin = require('firebase-admin');
const isLoggedIn = require('../middleware');
const userRole = require('../isUser');

const {
    initializeApp,
    applicationDefault,
    cert
} = require('firebase-admin/app');
const {
    getFirestore,
    Timestamp,
    FieldValue
} = require('firebase-admin/firestore');

const serviceAccount = require('../keys/firebase.json');

initializeApp({
    credential: cert(serviceAccount)
});
var admin = require('firebase-admin')

const db = getFirestore();


//insert Json
function insertItem(json, collection, doc) {
    if (doc == null) {
        db.collection(collection).add(json)
            .then(ref => {
                console.log('Added document with ID: ', ref.id);
            }).catch(err => {
                console.log('Error adding document: ', err);
            });
    } else {
        db.collection(collection).doc(doc).set(json)
            .then(ref => {
                console.log('Added document with ID: ', ref.id);
            }).catch(err => {
                console.log('Error adding document: ', err);
            });
    }
}


//check is first time login
async function checkFirstTimeLogin(json, uid) {
    await db.collection('users').doc(uid).get()
        .then(doc => {
            if (!doc.exists) {
                console.log("first time login");
                insertItem(json, 'users', uid);
            }
        }).catch(err => {
            console.log('Error getting document', err);
        });
}


//insert complaint
async function insertComplaint(uid, json,file,Idproofs) {
    json["Time"] = admin.firestore.Timestamp.fromDate(new Date());
   await db.collection('complaints').add(json)
        .then(ref => {
            console.log('Added document with ID: ', ref.id);
            db.collection('users').doc(uid).update({
                complaints: admin.firestore.FieldValue.arrayUnion(ref.id)
            }).then(ref => {
                console.log('Added document with ID: ', ref.id);
            }).catch(err => {
                console.log('Error adding document: ', err);
            });



            try {
              console.log(file);
            } catch (error) {
            }


        }).catch(err => {
            console.log('Error adding document: ', err);
        });
}


function getAllComplaints(cid) {
    db.collection("complaints").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            return doc.data();
        });
    });
}

async function getComplaintTypes(ministry){
  await db.collection("ministries").where("Name", "==", ministry).get().then((querySnapshot) => {
    var complaints_types = [];
    querySnapshot.forEach((doc) => {
        // console.log(doc.data());
        const data = doc.data().complaint_types;
        for(var i=0;i<data.length;i++)
          complaints_types.push(data[i]);
    });
    console.log(complaints_types);
    return complaints_types;
  })
}

router.get('/GetFullComplaint', isLoggedIn, async (req, res) => {
    var jsonData = {}
    await db.collection("complaints").doc(req.query.cid).get().then((querySnapshot) => {
        jsonData = querySnapshot.data();
    });
    var cid = req.query.cid;
    var uid = jsonData.UID;
    var user_id = req.session.user.idToken.payload.sub;

    await db.collection('users').doc(user_id).update({
        notifications: admin.firestore.FieldValue.arrayRemove({"cid":cid})
      }).then(ref => {
        console.log('Removed complaint id from notification: ', ref.id);
    }).catch(err => {
        console.log('Error removing complaint id from notification: ', err);
    });

    for (var i = 0; i < jsonData.comments.length; i++) {
        await db.collection("users").doc(jsonData.comments[i].uid).get().then((userdata) => {
            jsonData.comments[i]["uid"] = userdata.data().Name;
        })
    }
    res.render('user/complaintpage', {
        complaint: jsonData,
        cid: req.query.cid,
        UserData:req.session.user
    });

})

router.get('/GetFullComplaintAdmin1', userRole.isDesk1, async(req,res) => {
  var jsonData = {}
  await db.collection("complaints").doc(req.query.cid).get().then((querySnapshot) => {
    console.log(querySnapshot.id);
    jsonData = {...querySnapshot.data(), id: querySnapshot.id};
  })
  var user = req.session.user;
  var enduser;
  for (var i = 0; i < jsonData.comments.length; i++) {
      await db.collection("users").doc(jsonData.comments[i].uid).get().then((userdata) => {
          jsonData.comments[i]["uid"] = userdata.data().Name;
      })
  }
  await db.collection("users").doc(jsonData.UID).get().then((userData) => {
    enduser = userData.data();
  })
  console.log(jsonData);
  res.render('desk1/complaintpage', {
      complaint: jsonData,
      cid: req.query.cid,
      UserData: user,
      EndUserData: enduser
  });
})

router.get('/GetFullComplaintAdmin2', userRole.isDesk2, async(req,res) => {
  var jsonData = {}
  await db.collection("complaints").doc(req.query.cid).get().then((querySnapshot) => {
    console.log(querySnapshot.id);
    jsonData = {...querySnapshot.data(), id: querySnapshot.id};
  })
  var user = req.session.user;
  var enduser;
  for (var i = 0; i < jsonData.comments.length; i++) {
      await db.collection("users").doc(jsonData.comments[i].uid).get().then((userdata) => {
          jsonData.comments[i]["uid"] = userdata.data().Name;
      })
  }
  await db.collection("users").doc(jsonData.UID).get().then((userData) => {
    enduser = userData.data();
  })
  console.log(jsonData);
  res.render('desk2/complaintpage', {
      complaint: jsonData,
      cid: req.query.cid,
      UserData: user,
      EndUserData: enduser
  });
})

router.get('/Dashboard', userRole.isUser, async (req,res)=>{
  var complaint_ids;
  var userinfo;
  var notifications = [];
  await db.collection("users").doc(req.session.user.idToken.payload.sub).get().then((doc) => {
        console.log(doc.data());
        complaint_ids=doc.data().complaints;
        notifications=doc.data().notifications;
        userinfo = doc.data();
  });

  var approved=0, rejected=0, pending=0;

  var complaints = [];
  for(var i=0;i<complaint_ids.length;i++){
    await db.collection("complaints").doc(complaint_ids[i]).get().then((querySnapshot) => {
        var tpjson = querySnapshot.data();
        tpjson["cid"]=complaint_ids[i];
        if(tpjson.status == "Approved"){
          approved++;
        }
        else if(tpjson.status == "Rejected"){
          rejected++;
        }
        else {
          pending++;
        }
        complaints.push(tpjson);
    });

  }
  console.log(notifications);
  res.render('user/dashboard',{userData:userinfo,complaints:complaints,
                               approved:approved,pending:pending,
                               rejected: rejected, notifications: notifications});
})

router.get('/OnboardAdmin',isLoggedIn, async (req,res) => {
    var ministries = [];
    await db.collection("ministries").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          console.log(doc.data());
          ministries.push(doc.data().Name);
      });
    })
    console.log(ministries);
    res.render('superadmin/onboard_admins', {ministries: ministries});
})

router.get('/Desk1Dashboard', userRole.isDesk1, async (req,res)=>{
  const ministry = req.session.user.idToken.payload['custom:ministry'];
  console.log(ministry);
  var complaint_types = []
  await db.collection("ministries").where("Name", "==", ministry).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        const data = doc.data().complaint_types;
        for(var i=0;i<data.length;i++)
          complaint_types.push(data[i]);
    });
  })
  var complaints = [];
  var userinfo = [];
  for(var i=0;i<complaint_types.length;i++){
    await db.collection("complaints").where("type", "==", complaint_types[i]).where("current_desk", "==", 1).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        complaints.push({...doc.data(), id: doc.id});
      })
    })
  }
  var approved=0,pending=0,rejected=0;
  for(var i=0;i<complaints.length;i++){
    await db.collection("users").doc(complaints[i].UID).get().then((userData) => {
      userinfo.push(userData.data());
    })
    pending++;
  }
  console.log(complaints);
  var signedin_user_info = req.session.user;
  var userId = req.session.user.idToken.payload.sub;
  var complaints_resolved = [];
  await db.collection("users").doc(userId).get().then((doc) => {

      complaints_resolved = doc.data().complaints_resolved;

  })
  console.log(complaints_resolved);
  for(var i=0;i<complaints_resolved.length;i++){
    if(complaints_resolved[i].status == "Approved"){
      approved++;
    }
    else{
      rejected++;
    }
  }
  res.render('desk1/desk1dashboard',{signedin_user_info: signedin_user_info, userinfo: userinfo, complaints: complaints, approved: approved, rejected: rejected, pending: pending});
})

router.get('/Desk2Dashboard', userRole.isDesk2, async (req,res)=>{
  const ministry = req.session.user.idToken.payload['custom:ministry'];
  var complaint_types = []
  await db.collection("ministries").where("Name", "==", ministry).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        const data = doc.data().complaint_types;
        for(var i=0;i<data.length;i++)
          complaint_types.push(data[i]);
    });
  })
  var complaints = [];
  var userinfo = [];
  for(var i=0;i<complaint_types.length;i++){
    await db.collection("complaints").where("type", "==", complaint_types[i]).where("current_desk", "==", 2).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        complaints.push({...doc.data(), id: doc.id});
      })
    })
  }
  var approved=0,pending=0,rejected=0;
  for(var i=0;i<complaints.length;i++){
    await db.collection("users").doc(complaints[i].UID).get().then((userData) => {
      userinfo.push(userData.data());
    })
    pending++;
  }
  var signedin_user_info = req.session.user;
  var userId = req.session.user.idToken.payload.sub;
  var complaints_resolved = [];
  await db.collection("users").doc(userId).get().then((querySnapshot) => {
    complaints_resolved = querySnapshot.data().complaints_resolved;
  })
  for(var i=0;i<complaints_resolved.length;i++){
    if(complaints_resolved[i].status == "Approved"){
      approved++;
    }
    else{
      rejected++;
    }
  }
  res.render('desk2/desk2dashboard',{signedin_user_info: signedin_user_info, userinfo: userinfo, complaints: complaints, approved: approved, rejected: rejected, pending: pending});
})

router.get('/approveComplaintDesk1/',userRole.isDesk1, async (req,res)=>{
  var complaint_id = req.query.cid;
  approveComplaintDesk1(complaint_id);
  var user_id;
  var email = req.session.user.idToken.payload.email;
  console.log(email);
  await db.collection("users").where("Email", "==", email).get().then((userData) => {
    userData.forEach((doc) => {
      user_id = doc.id;
    })
  })

  addComment(complaint_id,user_id,"Initial processing of complaint done.",req.session.user.idToken.payload["custom:role"]);
  await db.collection('users').doc(user_id).update({
      complaints_resolved: admin.firestore.FieldValue.arrayUnion({
          cid: complaint_id,
          time: admin.firestore.Timestamp.fromDate(new Date()),
          status: "Approved"
      })
  }).then(ref => {
      console.log('Added comaplaint id: ', ref.id);
  }).catch(err => {
      console.log('Error adding complaint id: ', err);

  });

  var end_user_id;
  await db.collection('complaints').doc(complaint_id).get().then((complaint) => {
    end_user_id = complaint.data().UID;
  })
  await db.collection('users').doc(end_user_id).update({
      notifications: admin.firestore.FieldValue.arrayUnion({
          cid: complaint_id
      })
  }).then(ref => {
      console.log('Added comaplaint id: ', ref.id);
  }).catch(err => {
      console.log('Error adding complaint id: ', err);
  });

  return res.redirect('/Desk1Dashboard');
});

router.get('/approveComplaintDesk2/',userRole.isDesk1, async (req,res)=>{
  var complaint_id = req.query.cid;
  approveComplaintDesk2(complaint_id);
  var user_id = req.session.user.idToken.payload.sub;
  addComment(complaint_id,user_id,"Complaint has been processed and resolved.",req.session.user.idToken.payload["custom:role"]);
  console.log(complaint_id);
  console.log(user_id);
  await db.collection('users').doc(user_id).update({
      complaints_resolved: admin.firestore.FieldValue.arrayUnion({
          cid: complaint_id,
          time: admin.firestore.Timestamp.fromDate(new Date()),
          status: "Approved"
      })
  }).then(ref => {
      console.log('Added complaint id: ', ref.id);
  }).catch(err => {
      console.log('Error adding complaint id: ', err);
  });

  var end_user_id;
  await db.collection('complaints').doc(complaint_id).get().then((complaint) => {
    end_user_id = complaint.data().UID;
  })
  await db.collection('users').doc(end_user_id).update({
      notifications: admin.firestore.FieldValue.arrayUnion({
          cid: complaint_id
      })
  }).then(ref => {
      console.log('Added complaint id: ', ref.id);
  }).catch(err => {
      console.log('Error adding complaint id: ', err);
  });
  return res.redirect('/Desk2Dashboard');
});

router.get('/rejectComplaint/',userRole.isStaff, async (req,res)=>{
  var complaint_id = req.query.cid;
  rejectComplaint(complaint_id);
  var user_id = req.session.user.idToken.payload.sub;
  addComment(complaint_id,user_id,"Complaint has been rejected due to certain reasons.",req.session.user.idToken.payload["custom:role"]);
  await db.collection('users').doc(user_id).update({
      complaints_resolved: admin.firestore.FieldValue.arrayUnion({
          cid: complaint_id,
          time: admin.firestore.Timestamp.fromDate(new Date()),
          status: "Rejected"
      })
  }).then(ref => {
      console.log('Added complaint id: ', ref.id);
  }).catch(err => {
      console.log('Error adding complaint id: ', err);
  });

  var end_user_id;
  await db.collection('complaints').doc(complaint_id).get().then((complaint) => {
    end_user_id = complaint.data().UID;
  })
  await db.collection('users').doc(end_user_id).update({
      notifications: admin.firestore.FieldValue.arrayUnion({
          cid: complaint_id
      })
  }).then(ref => {
      console.log('Added complaint id: ', ref.id);
  }).catch(err => {
      console.log('Error adding complaint id: ', err);
  });

  var role = req.session.user.idToken.payload['custom:role'];

  if(role == "desk1"){
      return res.redirect('/Desk1Dashboard');
  } else {
      return res.redirect('/Desk2Dashboard');
  }
})

function updateComplaint(cid, data)
{
  db.collection("complaints").doc(cid).update(data);
}

function approveComplaintDesk1(cid)
{
  db.collection("complaints").doc(cid).update({current_desk: 2});
}

function approveComplaintDesk2(cid)
{
  db.collection("complaints").doc(cid).update({current_desk: 3, status: "Approved"});
}

function rejectComplaint(cid)
{
  db.collection("complaints").doc(cid).update({status: "Rejected"});
}

async function addComment(cid,uid,comment,role="user")
{
    await db.collection('complaints').doc(cid).update({
        comments: admin.firestore.FieldValue.arrayUnion({
            uid: uid,
            time: admin.firestore.Timestamp.fromDate(new Date()),
            comment: comment
        })
    }).then(ref => {
        console.log('Added document with ID: ', ref.id);
    }).catch(err => {
        console.log('Error adding document: ', err);
    });
    console.log(role);
    if(role != "user"){
      var end_user_id;
      await db.collection('complaints').doc(cid).get().then((complaint) => {
        end_user_id = complaint.data().UID;
      })
      await db.collection('users').doc(end_user_id).update({
          notifications: admin.firestore.FieldValue.arrayUnion({
              cid: cid
          })
      }).then(ref => {
          console.log('Added comaplaint id: ', ref.id);
      }).catch(err => {
          console.log('Error adding complaint id: ', err);
      });
    }
}

function updateUser(uid,userData)
{
    db.collection('users').doc(uid).update({
        ...userData
    }).then(ref => {
        console.log('Added document with ID: ', ref.id);
    }).catch(err => {
        console.log('Error adding document: ', err);
    });
}

//get comments
function getComments(cid) {
    db.collection('complaints').doc(cid).get().then((querySnapshot) => {
        console.log(querySnapshot.data().comments);
    }).catch(err => {
        console.log('Error getting document', err);
    });
}
// getComments('34e0a738-9426-4efb-b721-bb7502fe96c01660976645775')

router.get('/ComplaintRegistration', userRole.isUser, async (req, res) => {
  var subType=[]
  await db.collection("ministries").where("Name","==",req.query.ministry).get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      subType = doc.data().complaint_types;
    })
  }).catch(err => {
    console.log('Error getting document', err);
  });
  console.log(subType);
  res.render('user/complaintRegistration',{ministry:req.query.ministry, userData:req.session.user, subType:subType});
})


router.get('/getObject',(req,res)=>{

  // get the current user complaint details
  var user = req.session.user;

  let s3 = new AWS.S3();
    async function getImage(){
      const data =  s3.getObject(
        {
            Bucket: 'complaint-bucket-sih',
            Key: "mpv-shot0004.jpg"
          }

      ).promise();
      return data;
    }


    getImage()
    .then((img)=>{

      res.send(image)
    }).catch((e)=>{
      res.send(e)
    })

    function encode(data){
        let buf = Buffer.from(data);
        let base64 = buf.toString('base64');
        return base64
    }

})

module.exports = {
    router: router,
    insertItem: insertItem,
    checkFirstTimeLogin: checkFirstTimeLogin,
    insertComplaint: insertComplaint,
    getAllComplaints: getAllComplaints,
    addComment: addComment,
    updateComplaint: updateComplaint,
    approveComplaintDesk1: approveComplaintDesk1,
    approveComplaintDesk2: approveComplaintDesk2,
    rejectComplaint: rejectComplaint,
    updateUser: updateUser
};
