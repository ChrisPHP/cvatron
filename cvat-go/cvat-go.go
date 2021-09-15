package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "os/exec"
  "encoding/json"
  "io/ioutil"
  "io"
  "path/filepath"
  "mime/multipart"
  "bufio"
  "bytes"
  "strings"

  "github.com/vincent-petithory/dataurl"
  "github.com/gorilla/mux"
  "github.com/acarl005/stripansi"
)
type Res struct {
  Out string
  Err string
}

type Files struct {
  Name []string
}

type Kmeans struct {
  Ref []string
  Cls []string
  Grn []string
}

type Install struct {
  Result string
}

type Tconfig struct {
  Task string
  Predictor string
  Output string
  Threshold string
}

type Config struct {
  Task string
  Dataset string
  Workers string
  Ims string
  LearnRate string
  Iterations string
  BatchSize string
  NumClassifiers string
  ModelWeights string
  ResumeTrain string
  Predictor string
  Output string
  Threshold string
}

func setupRoutes() {
  router := NewRouter()
  router.HandleFunc("/", Index)
  router.HandleFunc("/Api", ReponseTest)
  router.HandleFunc("/Train", WriteTrain)
  router.HandleFunc("/Test", WriteTest)
  router.HandleFunc("/upload", UploadImages)
  router.HandleFunc("/update", UpdateClient)
  router.HandleFunc("/Kmeans", KmeansImages)
  router.HandleFunc("/KmeansRun", KmeansRun)
  router.HandleFunc("/KmeansPre", KmeansPreProcess)
  router.HandleFunc("/KmeansReflect", KmeansReflect)
  router.HandleFunc("/ProcessImage", ProcessImageNames)
  router.HandleFunc("/json", JsonImage)
  log.Fatal(http.ListenAndServe(":4000", router))
}

func main() {
  setupRoutes()
  fmt.Println("Ready To Serve")
}

//=====================================
//Kmeans and image annotation ColorMode
//=====================================

//Get image names
func ProcessImageNames(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  files := GetFileContents("static/original/")

  elems := len(files)

  var ins Files

  left := make([]string, elems)

  for i := range files {
    left[i] = files[i]
    fmt.Println(left[i])
  }

  ins = Files{Name: left}

  byteArray, err := json.Marshal(ins)
  if err != nil {
    fmt.Println(err)
  }
  w.Write(byteArray)

  return
}

func JsonImage(w http.ResponseWriter, r *http.Request) {
  buf := new(bytes.Buffer)
  buf.ReadFrom(r.Body)
  url := buf.String()
  url = strings.Replace(url, "data:image/png;base64", "data:image/png;name=maskjson;base64", 1)
  url = strings.Trim(url, "\"");
  fmt.Println(url)
  dataURL, err := dataurl.DecodeString(url)
  defer r.Body.Close()
  if err != nil {
    http.Error(w, err.Error(), http.StatusBadRequest)
    fmt.Println(err)
    return
  }
  if dataURL.ContentType() == "image/png" {
    ioutil.WriteFile("./static/mask/image.png", dataURL.Data, 0644)
  } else {
    http.Error(w, "not a png", http.StatusBadRequest)
  }
}


func KmeansPreProcess(w http.ResponseWriter, r *http.Request) {

  files := GetFileContents("static/mask/")

  if (len(files) != 0) {
    fmt.Println("not empty")
    KmeansRun(w, r)
  } else {


  files = GetFileContents("static/")

  for i := range files {
    cmd := exec.Command("python3" , "kmeans/intrinsic/decompose.py", files[i], "-q")
    _, err := cmd.Output()
    if err != nil {
      fmt.Println(err)
    }
  }

    KmeansRun(w, r)
  }
}

func KmeansImages(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  fmt.Println("Success")

  files := GetFileContents("static/original/")

  for i := range files {
    err := os.Remove("static/original/" +  files[i])
    if err != nil {
      fmt.Println(err)
    }
  }

  GetTaskImages(w, r, "Kmeans")

  files = GetFileContents("static/original/")

  elems := len(files)

  var ins Files

  left := make([]string, elems)

  for i := range files {
    left[i] = files[i]
    fmt.Println(left[i])
  }

  ins = Files{Name: left}

  byteArray, err := json.Marshal(ins)
  if err != nil {
    fmt.Println(err)
  }
  w.Write(byteArray)

  return
}

//Kmeans processing

func KmeansReflect(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  files := GetFileContents("static/original/")
  mem := GetFileContents("static/reflect/")

  for i := range mem {
    err := os.Remove("static/reflect/" +  mem[i])
    if err != nil {
      fmt.Println(err)
    }
  }

  elems := len(files)
  var ins Files
  left := make([]string, elems)

  for i := range files {
    cmd := exec.Command("python3", "kmeans/intrinsic/decompose.py", files[i])
    left[i] =  "r-" + files[i]
    _, err := cmd.Output()
    if err != nil {
      fmt.Println(err)
    }
  }

  ins = Files{Name: left}

  byteArray, err := json.Marshal(ins)
  if err != nil {
    fmt.Println(err)
  }

  w.Write(byteArray)
}

func KmeansRun(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  var c Config

  err := json.NewDecoder(r.Body).Decode(&c)
  if err != nil {
    fmt.Println(err)
  }

  rem := GetFileContents("static/process/")

  for i := range rem {
    err := os.Remove("static/process/" +  rem[i])
    if err != nil {
      fmt.Println(err)
    }
  }


  files := GetFileContents("static/original/")

  fmt.Println(files)

  for i := range files {
    //cmd := exec.Command("python3" , "kmeans/kmeans.py", file.Name())
    //cmd := exec.Command("python3" , "kmeans/intrinsic/decompose.py", file.Name(), "-q")
    //_, err = cmd.Output()

    cmd := exec.Command("python3" , "kmeans/preprocess.py", files[i], c.Task)
    cmd.Stdout = os.Stdout
  	cmd.Stderr = os.Stderr
    err := cmd.Run()
    if err != nil {
      fmt.Println(err)
    }
  }

  elems := len(files)
  var ins Kmeans
  left_r := make([]string, elems)
  left_c := make([]string, elems)
  left_g := make([]string, elems)

  for i := range files {
    if (files[i] != "process") {
      //cmd := exec.Command("python3" , "kmeans/intrinsic/decompose.py", file.Name(), "-q")
      //_, err = cmd.Output()
      left_r[i] = files[i]
      left_c[i] = "c-" + files[i]
      left_g[i] = "g-" + files[i]
    }
  }

  ins = Kmeans{Ref: left_r,
              Cls: left_c,
              Grn: left_g,}

  byteArray, err := json.Marshal(ins)
  if err != nil {
    fmt.Println(err)
  }

  w.Write(byteArray)
}

//===================================
// Kmeans ends
//===================================


func GetFileContents(dir string) ([]string) {

  files, err := ioutil.ReadDir(dir)
  if err != nil {
    log.Fatal(err)
  }

  elems := len(files)
  names := make([]string, elems)

  for i, file := range files {
    names[i] = file.Name()
  }
  return names
}

func NewRouter() *mux.Router {
  router := mux.NewRouter().StrictSlash(true)

  staticDir := "/static/"

  router.
    PathPrefix(staticDir).
    Handler(http.StripPrefix(staticDir, http.FileServer(http.Dir("."+staticDir))))

  return router
}


func ReponseTest(w http.ResponseWriter, r *http.Request) {
  res := Res{"Monke", "test"}

  js, err := json.Marshal(res)
  if err != nil {
    fmt.Println(err)
  }

  w.Header().Set("Content-Type", "application/json")
  w.Write(js)
}

func UpdateClient(w http.ResponseWriter, r *http.Request) {
  content, err := ioutil.ReadFile("data.txt")

  if err != nil {
    log.Fatal(err)
  }

  ins := Res{Out: string(content)}

  byteArray, err := json.Marshal(ins)
  if err != nil {
    fmt.Println(err)
  }
  w.Write(byteArray)

  return
}

func Index(w http.ResponseWriter, r *http.Request) {
  cmd := exec.Command("python" , "-c", "import detectron2")
  _, err := cmd.Output()



  if err != nil {
    ins := Install{Result: "Detectron2 not found"}
    byteArray, err := json.Marshal(ins)
    if err != nil {
      fmt.Println(err)
    }
    fmt.Println(string(byteArray))
    json.NewEncoder(w).Encode(ins)

    return
  }

  ins := Install{Result: "Detectron2 was found"}

  byteArray, err := json.Marshal(ins)
  if err != nil {
    fmt.Println(err)
  }

  json.NewEncoder(w).Encode(ins)
  fmt.Println(string(byteArray))
}

func GetTaskImages(w http.ResponseWriter, r *http.Request, FormName string) (Config) {
  var c Config

  err := json.NewDecoder(r.Body).Decode(&c)
  if err != nil {
    fmt.Println(err)
  }

  var Names []string
  var files []string

  root := "../data/data/" + c.Task + "/raw"
  err  = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
    if (filepath.Ext(info.Name()) == ".png") {
      files = append(files, path)
      Names = append(Names, info.Name())
    }
    return nil
  })
  if err != nil {
    panic(err)
  }
  for i, file := range files {
    CopyFileOver(file, Names[i], FormName)
  }
  return c
}

func CopyFileOver(file string, Name string, FormName string) {
    sourceFile, err := os.Open(file)
    if err != nil {
      fmt.Println(err)
    }
    defer sourceFile.Close()

    if (FormName == "Kmeans") {
      newFile, err := os.Create("static/original/" + Name)

      if err != nil {
        fmt.Println(err)
      }
      defer newFile.Close()

      _, err = io.Copy(newFile, sourceFile)

      if err != nil {
        fmt.Println(err)
      }

    } else {
      newFile, err := os.Create("detectron/" + FormName + "/images/" + Name)

      if err != nil {
        fmt.Println(err)
      }
      defer newFile.Close()

      _, err = io.Copy(newFile, sourceFile)

      if err != nil {
        fmt.Println(err)
      }
    }


}

func LogFile(wr error) {
  f, err := os.OpenFile("log.txt", os.O_RDWR | os.O_CREATE, 0666)
  if err != nil {
    log.Fatal("error opening file", err)
  }
  defer f.Close()

  log.SetOutput(f)
  log.Println(wr)
}

func ReadFile() (out string) {
  content, err := ioutil.ReadFile("log.txt")
  if err != nil {
    log.Fatal(err)
  }

  return string(content)
}

func TrainHandler(w http.ResponseWriter, r *http.Request) {

  cmd := exec.Command("python3", "detectron/vgw_all_train.py")
  var outb bytes.Buffer
  //fmt.Println(errb)
  cmd.Stdout = &outb
  stderr, _ := cmd.StdoutPipe()
  err := cmd.Start()
  f, err := os.Create("data.txt")

  if err != nil {
        log.Fatal(err)
  }

  defer f.Close()

  scanner := bufio.NewScanner(stderr)
  scanner.Split(bufio.ScanLines)
  for scanner.Scan() {
    m := scanner.Text()
    CleanMsg := stripansi.Strip(m)
    _, err = f.WriteString(CleanMsg)
    _, err = f.WriteString("\n")
    fmt.Println(CleanMsg)
  }
  cmd.Wait()
  //var a [2]string
  //x := cmd.Run()
  //fmt.Println(x.Error())
  //ConsoleChecker(w, r, x)
  return
}

func TestHandler(w http.ResponseWriter, r *http.Request) {
  cmd := exec.Command("python3", "detectron/vgw_all_test.py")
  //out, err := cmd.Output()

  stderr, _ := cmd.StdoutPipe()
  err := cmd.Start()

  f, err := os.Create("data.txt")

  if err != nil {
        log.Fatal(err)
  }

  defer f.Close()

  scanner := bufio.NewScanner(stderr)
  scanner.Split(bufio.ScanLines)
  for scanner.Scan() {
    m := scanner.Text()
    CleanMsg := stripansi.Strip(m)
    _, err = f.WriteString(CleanMsg)
    _, err = f.WriteString("\n")
    fmt.Println(CleanMsg)
  }
  cmd.Wait()
}

func WriteTest(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")
  T := GetTaskImages(w, r, "test")

  dir := "./output/" + T.Output
  err := os.Mkdir(dir, 0755 )

  f, err := os.Create("detectron/vgw_all_test.py")

  if err != nil {
    log.Fatal(err)
  }

  defer f.Close()

  imps := "import os, json, random, cv2, numpy\n\nfrom detectron2.data.datasets    import register_coco_instances\nfrom detectron2.engine           import DefaultTrainer\nfrom detectron2.config           import get_cfg\nfrom detectron2                  import model_zoo\nfrom detectron2.engine.defaults  import DefaultPredictor\nfrom vgw_all_train import trainer, cfg\nfrom detectron2.utils.visualizer import Visualizer, ColorMode\nfrom detectron2.data.catalog     import DatasetCatalog, MetadataCatalog\nfrom detectron2.evaluation       import COCOEvaluator, inference_on_dataset\nfrom detectron2.data             import build_detection_test_loader\n"

  conf := `cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST     =` + T.Threshold + "\n"
  conf += `predictor 				  =` + "DefaultPredictor(cfg)" + "\n"

  loop := `dataset_dicts = DatasetCatalog.get("vgw_all_test")` + "\n" + `vgw_cos_metadata = MetadataCatalog.get("vgw_all_test")` + "\n" + `for d in random.sample(dataset_dicts, 4):` + "\n" + `    fileName = d["file_name"]` + "\n" + `    im = cv2.imread(d["file_name"])` + "\n" + `    outputs = predictor(im)` + "\n" + `    v = Visualizer(im[:, :, ::-1],` + "\n" + `                   metadata=vgw_cos_metadata,` + "\n" + `                   scale=1.0,` + "\n" + `                   instance_mode=ColorMode.IMAGE` + "\n" + `    )` + "\n" + `    out = v.draw_instance_predictions(outputs["instances"].to("cpu"))` + "\n" + `    testImage=out.get_image()[:, :, ::-1]` + "\n" + `    fName=os.path.join(cfg.OUTPUT_DIR,` + `"` + T.Output +  `"` + `, os.path.basename(fileName))` + "\n" + `    print(fName)` + "\n" + `    cv2.imwrite(fName,testImage)` + "\n" + `evaluator = COCOEvaluator("vgw_all_test", cfg, False, output_dir="./output/")` + "\n" + `val_loader = build_detection_test_loader(cfg, "vgw_all_test")` + "\n" + `print(inference_on_dataset(trainer.model, val_loader, evaluator))`

  imps += conf + loop

  _, err = f.WriteString(imps)

  if err != nil {
    log.Fatal(err)
  }

  TestHandler(w, r)
}

func WriteTrain(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "application/json")

  c := GetTaskImages(w, r, "train")

  f, err := os.Create("detectron/vgw_all_train.py")

  if err != nil {
    log.Fatal(err)
    fin := Res{Out: "Unable to create python file for training"}
    byteArray, err := json.Marshal(fin)
    if err != nil {
      fmt.Println(err)
    }
    w.Write(byteArray)
  }

  defer f.Close()

  fmt.Println("help");

  imps := "import os\nfrom detectron2.data.datasets import register_coco_instances\nfrom detectron2.engine        import DefaultTrainer\nfrom detectron2.config         import get_cfg\nfrom detectron2               import model_zoo\n\n"

  reg := `register_coco_instances("vgw_cos_train", {}, "detectron/train/annotations/annotations/instances_default.json", "detectron/train/annotations/images/")` + "\n"
  reg += `register_coco_instances("vgw_all_test", {}, "detectron/test/annotations/alltest200/output.json", "detectron/test/images/")` + "\n\n"

  cfg := `cfg = get_cfg()` + "\n"
  cfg += `cfg.merge_from_file(model_zoo.get_config_file("` + c.Dataset+ `"))` + "\n"

  params := `cfg.DATASETS.TRAIN                       = ("vgw_cos_train",)` + "\n"
  params += `cfg.DATALOADER.NUM_WORKERS               =` + c.Workers + "\n"
  params += `cfg.MODEL.WEIGHTS                        = model_zoo.get_checkpoint_url("` + c.Dataset + `")` + "\n"
  params += `cfg.SOLVER.IMS_PER_BATCH                 =` + c.Ims + "\n"
  params += `cfg.SOLVER.BASE_LR                       =` + c.LearnRate + "\n"
  params += `cfg.SOLVER.MAX_ITER                      =` + c.Iterations + "\n"
  params += `cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE =` + c.BatchSize + "\n"
  params += `cfg.MODEL.ROI_HEADS.NUM_CLASSES          =` + c.NumClassifiers + "\n"
  params += `cfg.MODEL.WEIGHTS                        = os.path.join(cfg.OUTPUT_DIR,"model_final.pth")` + "\n"

  out := `#print(cfg.OUTPUT_DIR)` + "\n"
  out += `os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)` + "\n"
  out += `trainer = DefaultTrainer(cfg)` + "\n"
  out += `trainer.resume_or_load(resume=`+ c.ResumeTrain + `)` + "\n"
  out += `trainer.train()` + "\n"

  imps += reg + cfg + params + out

  _, err2 := f.WriteString(imps)

  if err2 != nil {
    log.Fatal(err2)
    fin := Res{Out: "Unable to write to python file for training"}
    byteArray, err := json.Marshal(fin)
    if err != nil {
      fmt.Println(err)
    }
    w.Write(byteArray)
  }

  TrainHandler(w, r)
}

func UploadImages(w http.ResponseWriter, r *http.Request) {
  fmt.Println("recieved")

  err := r.ParseMultipartForm(32 << 20)
  if err != nil {
    fmt.Println(err)
  }

  files := r.MultipartForm.File["file"]

  for _, handler := range files {
    file, err := handler.Open()
    defer file.Close()
    if err != nil {
      fmt.Println(err)
      return
    }
    SaveFile(w, file, handler, r)
  }

  return
}

func SaveFile(w http.ResponseWriter, file multipart.File, handler *multipart.FileHeader, r *http.Request) {
  data, err := ioutil.ReadAll(file)
  if err != nil {
    fmt.Println(err)
    return
  }

  err = ioutil.WriteFile("detectron/" + r.FormValue("name") + "/images/"+handler.Filename, data, 0666)
  if err != nil {
    fmt.Println(w, "%v", err)
    return
  }

  w.Write([]byte("Images Successfully Uploaded"))
  return
}


func save() {
  cmd := exec.Command("detect.sh")
  out, err := cmd.Output()

  if err != nil {
    fmt.Println(err.Error())
    return
  }

  fmt.Println(string(out))
}
