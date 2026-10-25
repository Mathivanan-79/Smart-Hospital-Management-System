import { useEffect, useState } from "react";
import api from "../services/api";

function Patients() {

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    address: "",
    emergencyContact: "",
  });


  // ================= FETCH PATIENTS =================

  const loadPatients = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get("/api/patients");

      setPatients(response.data);

    } catch (err) {

      console.error(
        "Patients loading error:",
        err
      );

      setError(
        "Unable to load patients."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadPatients();

  }, []);


  // ================= FORM CHANGE =================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // ================= OPEN FORM =================

  const openForm = () => {

    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      phone: "",
      address: "",
      emergencyContact: "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);

  };


  // ================= CLOSE FORM =================

  const closeForm = () => {

    if (saving) {
      return;
    }

    setShowForm(false);

  };


  // ================= ADD PATIENT =================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
      };

      await api.post(
        "/api/patients",
        payload
      );

      setSuccess(
        "Patient added successfully."
      );

      setShowForm(false);

      await loadPatients();

    } catch (err) {

      console.error(
        "Add patient error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Unable to add patient.";

      setError(message);

    } finally {

      setSaving(false);

    }

  };


  // ================= SEARCH =================

  const filteredPatients = patients.filter(
    (patient) => {

      const searchText =
        search.toLowerCase();

      return (
        String(patient.id || "")
          .toLowerCase()
          .includes(searchText) ||

        String(patient.fullName || "")
          .toLowerCase()
          .includes(searchText) ||

        String(patient.email || "")
          .toLowerCase()
          .includes(searchText) ||

        String(patient.phone || "")
          .toLowerCase()
          .includes(searchText)
      );

    }
  );


  return (
    <div>

      {/* ================= HEADER ================= */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
        mb-8
      ">

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-[#111111]
          ">
            Patients
          </h1>

          <p className="
            text-gray-500
            mt-2
          ">
            Manage registered hospital patients
          </p>

        </div>


        <button
          onClick={openForm}
          className="
            bg-[#111111]
            text-white
            px-5
            py-2.5
            rounded-lg
            text-sm
            font-medium
            hover:bg-black
            transition
          "
        >
          + Add Patient
        </button>

      </div>


      {/* ================= SUCCESS ================= */}

      {success && (

        <div className="
          mb-6
          border
          border-green-200
          bg-green-50
          text-green-700
          px-4
          py-3
          rounded-lg
          text-sm
        ">
          {success}
        </div>

      )}


      {/* ================= ERROR ================= */}

      {error && (

        <div className="
          mb-6
          border
          border-red-200
          bg-red-50
          text-red-700
          px-4
          py-3
          rounded-lg
          text-sm
        ">
          {error}
        </div>

      )}


      {/* ================= ADD PATIENT MODAL ================= */}

      {showForm && (

        <div className="
          fixed
          inset-0
          z-50
          bg-black/40
          flex
          items-center
          justify-center
          p-4
        ">

          <div className="
            bg-white
            w-full
            max-w-2xl
            rounded-xl
            shadow-xl
            max-h-[90vh]
            overflow-y-auto
          ">


            {/* ================= MODAL HEADER ================= */}

            <div className="
              px-6
              py-5
              border-b
              border-[#e5e5e5]
              flex
              items-center
              justify-between
            ">

              <div>

                <h2 className="
                  text-lg
                  font-semibold
                  text-[#111111]
                ">
                  Add Patient
                </h2>

                <p className="
                  text-xs
                  text-gray-500
                  mt-1
                ">
                  Create patient account and profile
                </p>

              </div>


              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="
                  text-gray-400
                  hover:text-black
                  text-xl
                  disabled:opacity-50
                "
              >
                ×
              </button>

            </div>


            {/* ================= FORM ================= */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
              ">


                {/* ================= ACCOUNT SECTION ================= */}

                <div className="md:col-span-2">

                  <h3 className="
                    text-sm
                    font-semibold
                    text-[#111111]
                    mb-1
                  ">
                    Account Details
                  </h3>

                  <p className="
                    text-xs
                    text-gray-500
                  ">
                    Login credentials for the patient
                  </p>

                </div>


                {/* USERNAME */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Username *
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                    minLength={3}
                    maxLength={50}
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                    "
                  />

                </div>


                {/* EMAIL */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="patient@example.com"
                    required
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                    "
                  />

                </div>


                {/* PASSWORD */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Password *
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                    "
                  />

                </div>


                {/* ================= PATIENT SECTION ================= */}

                <div className="md:col-span-2 mt-2">

                  <h3 className="
                    text-sm
                    font-semibold
                    text-[#111111]
                    mb-1
                  ">
                    Patient Details
                  </h3>

                  <p className="
                    text-xs
                    text-gray-500
                  ">
                    Basic patient information
                  </p>

                </div>


                {/* FULL NAME */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                    "
                  />

                </div>


                {/* DATE OF BIRTH */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Date of Birth *
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                    "
                  />

                </div>


                {/* GENDER */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Gender *
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                      bg-white
                    "
                  >

                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* BLOOD GROUP */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Blood Group
                  </label>

                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                      bg-white
                    "
                  >

                    <option value="">
                      Select blood group
                    </option>

                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>

                  </select>

                </div>


                {/* PHONE */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                    "
                  />

                </div>


                {/* EMERGENCY CONTACT */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Emergency Contact
                  </label>

                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency contact number"
                    className="
                      w-full
                      h-10
                      px-3
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                    "
                  />

                </div>


                {/* ADDRESS */}

                <div className="md:col-span-2">

                  <label className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                  ">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    rows="3"
                    className="
                      w-full
                      px-3
                      py-2
                      border
                      border-[#dcdcdc]
                      rounded-lg
                      text-sm
                      outline-none
                      focus:border-[#111111]
                      resize-none
                    "
                  />

                </div>

              </div>


              {/* ================= FORM ACTIONS ================= */}

              <div className="
                flex
                justify-end
                gap-3
                mt-7
                pt-5
                border-t
                border-[#e5e5e5]
              ">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="
                    px-5
                    py-2.5
                    border
                    border-[#dcdcdc]
                    rounded-lg
                    text-sm
                    font-medium
                    text-gray-600
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="
                    px-5
                    py-2.5
                    bg-[#111111]
                    text-white
                    rounded-lg
                    text-sm
                    font-medium
                    hover:bg-black
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? "Creating..."
                    : "Add Patient"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================= PATIENT TABLE ================= */}

      <div className="
        bg-white
        border
        border-[#e5e5e5]
        rounded-xl
        overflow-hidden
      ">


        {/* ================= TOOLBAR ================= */}

        <div className="
          px-6
          py-5
          border-b
          border-[#e5e5e5]
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
        ">

          <div>

            <h2 className="
              text-base
              font-semibold
              text-[#111111]
            ">
              Patient List
            </h2>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">
              {patients.length} registered patient
              {patients.length !== 1 ? "s" : ""}
            </p>

          </div>


          {/* SEARCH */}

          <div className="relative">

            <span className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              text-sm
            ">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full
                md:w-72
                h-10
                pl-9
                pr-4
                border
                border-[#e5e5e5]
                rounded-lg
                text-sm
                outline-none
                focus:border-[#111111]
              "
            />

          </div>

        </div>


        {/* ================= LOADING ================= */}

        {loading ? (

          <div className="
            px-6
            py-12
            text-center
            text-sm
            text-gray-500
          ">
            Loading patients...
          </div>


        ) : filteredPatients.length === 0 ? (

          <div className="
            px-6
            py-12
            text-center
          ">

            <div className="
              text-3xl
              mb-3
            ">
              🧑‍🤝‍🧑
            </div>

            <p className="
              text-sm
              font-medium
              text-gray-700
            ">
              No patients found
            </p>

            <p className="
              text-xs
              text-gray-500
              mt-1
            ">
              Try changing your search.
            </p>

          </div>


        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="
                  bg-[#fafafa]
                  border-b
                  border-[#e5e5e5]
                ">

                  <th className="
                    text-left
                    px-6
                    py-3
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                  ">
                    ID
                  </th>

                  <th className="
                    text-left
                    px-6
                    py-3
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                  ">
                    Patient
                  </th>

                  <th className="
                    text-left
                    px-6
                    py-3
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                  ">
                    Gender
                  </th>

                  <th className="
                    text-left
                    px-6
                    py-3
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                  ">
                    Phone
                  </th>

                  <th className="
                    text-left
                    px-6
                    py-3
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                  ">
                    Blood Group
                  </th>

                  <th className="
                    text-right
                    px-6
                    py-3
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                  ">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredPatients.map(
                  (patient) => (

                    <tr
                      key={patient.id}
                      className="
                        border-b
                        border-[#eeeeee]
                        last:border-b-0
                        hover:bg-[#fafafa]
                        transition
                      "
                    >

                      {/* ID */}

                      <td className="
                        px-6
                        py-4
                        text-sm
                        font-medium
                        text-[#111111]
                      ">
                        #{patient.id}
                      </td>


                      {/* PATIENT */}

                      <td className="
                        px-6
                        py-4
                      ">

                        <div className="
                          flex
                          items-center
                          gap-3
                        ">

                          <div className="
                            w-9
                            h-9
                            rounded-full
                            bg-[#111111]
                            text-white
                            flex
                            items-center
                            justify-center
                            text-xs
                            font-semibold
                          ">
                            {patient.fullName
                              ? patient.fullName
                                  .charAt(0)
                                  .toUpperCase()
                              : "P"}
                          </div>


                          <div>

                            <p className="
                              text-sm
                              font-medium
                              text-[#111111]
                            ">
                              {patient.fullName || "-"}
                            </p>

                            <p className="
                              text-xs
                              text-gray-500
                              mt-0.5
                            ">
                              {patient.email || "No email"}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* GENDER */}

                      <td className="
                        px-6
                        py-4
                        text-sm
                        text-gray-600
                      ">
                        {patient.gender || "-"}
                      </td>


                      {/* PHONE */}

                      <td className="
                        px-6
                        py-4
                        text-sm
                        text-gray-600
                      ">
                        {patient.phone || "-"}
                      </td>


                      {/* BLOOD GROUP */}

                      <td className="
                        px-6
                        py-4
                      ">

                        <span className="
                          inline-flex
                          px-2.5
                          py-1
                          rounded-md
                          bg-gray-100
                          text-gray-700
                          text-xs
                          font-medium
                        ">
                          {patient.bloodGroup || "-"}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td className="
                        px-6
                        py-4
                        text-right
                      ">

                        <div className="
                          flex
                          justify-end
                          gap-2
                        ">

                          <button
                            type="button"
                            className="
                              px-3
                              py-1.5
                              border
                              border-[#e5e5e5]
                              rounded-md
                              text-xs
                              text-gray-600
                              hover:bg-gray-100
                              transition
                            "
                          >
                            View
                          </button>


                          <button
                            type="button"
                            className="
                              px-3
                              py-1.5
                              border
                              border-[#e5e5e5]
                              rounded-md
                              text-xs
                              text-gray-600
                              hover:bg-gray-100
                              transition
                            "
                          >
                            Edit
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Patients;