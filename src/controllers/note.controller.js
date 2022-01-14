const catchAsync = require("../utils/catchAsync");
const { admin, db } = require("../services/firebase");
const yup = require("yup");

const createNote = catchAsync(async (req, res) => {
  try {
    let schema = yup.object().shape({
      customer_id: yup.string().required(),
      employee_id: yup.string().required(),
      title: yup.string().required(),
      body: yup.string().required(),
    });

    //validate request body
    const isValid = await schema.isValid(req.body);

    if (isValid) {
      // create a new note from object above
      const note_collection = admin.firestore().collection("notes");
      const new_note = await note_collection.add({
        ...req.body,
        created_at: new Date().toUTCString(),
        updated_at: new Date().toUTCString(),
      });

      // return new note
      res.status(201).send({
        ...(await new_note.get()).data,
        id: (await new_note.get()).id,
      });
    } else {
      schema.validate(req.body).catch((e) => {
        res.status(400).send({ error: e.errors });
      });
    }
  } catch (error) {
    console.log("NOTE ERROR: ", error);
    res.status(400).send({ error });
  }
});

const getAllCustomerNotes = catchAsync(async (req, res) => {
  try {
    let id = req.params.id;

    const snapshot = await admin
      .firestore()
      .collection("notes")
      .where("customer_id", "==", id)
      .get();

    let collection = await Promise.all(
      snapshot.docs.map(async (doc) => {
        let employee = await admin
          .firestore()
          .collection("employees")
          .where("uid", "==", doc.data()?.employee_id)
          .get();
        let [employee_result] = employee.docs;

        let payload = {
          id: doc.id,
          ...doc.data(),
          employee: { ...employee_result.data(), id: employee_result.id },
        };
        return payload;
      })
    );
    res.status(200).send(collection);
  } catch (error) {
    console.log("NOTE ERROR: ", error);
    res.status(500).send({ message: error });
  }
});

const updateNote = catchAsync(async (req, res) => {
  try {
    // validate data
    let schema = yup.object().shape({
      customer_id: yup.string().required(),
      employee_id: yup.string().required(),
      title: yup.string().required(),
      body: yup.string().required(),
    });

    const isValid = await schema.isValid(req.body);

    if (isValid) {
      // get note from db
      let id = req.params?.id;
      let note = db.collection("notes").doc(id);

      await note.update({
        ...req.body,
        updated_at: new Date().toUTCString(),
      });

      res.status(200).send({ message: "updated" });
    } else {
      schema.validate(req.body).catch((e) => {
        res.status(400).send({ error: e.errors });
      });
    }
  } catch (error) {
    console.log("NOTE ERROR: ", error);
    res.status(400).send({ message: error });
  }
});

const deleteNote = catchAsync(async (req, res) => {
  try {
    let id = req.params?.id;
    let note = db.collection("notes").doc(id);
    await note.delete();

    res.status(200).send({ message: "deleted" });
  } catch (error) {
    console.log("NOTE ERROR: ", error);
    res.status(400).send({ message: error });
  }
});

module.exports = {
  createNote,
  getAllCustomerNotes,
  updateNote,
  deleteNote,
};
