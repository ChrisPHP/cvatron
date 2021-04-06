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

  "github.com/gorilla/mux"
)

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
  router := mux.NewRouter().StrictSlash(true)
  router.HandleFunc("/", Index)
  router.HandleFunc("/Api", Index)
  router.HandleFunc("/Train", WriteTrain)
  router.HandleFunc("/Test", WriteTest)
  router.HandleFunc("/upload", UploadImages)
  log.Fatal(http.ListenAndServe(":4000", router))
}

func main() {
  setupRoutes()
  fmt.Println("Ready To Serve")
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

func TrainHandler(w http.ResponseWriter, r *http.Request) {
  cmd := exec.Command("python", "detectron/vgw_all_train.py")
  cmd.Stdout = os.Stdout
  cmd.Stderr = os.Stderr
  fmt.Println(cmd.Run())

  fin := Install{Result: "finished"}
  byteArray, err := json.Marshal(fin)
  if err != nil {
    fmt.Println(err)
  }

  fmt.Println(string(byteArray))
  json.NewEncoder(w).Encode(fin)

  return
}

func TestHandler(w http.ResponseWriter, r *http.Request) {
  cmd := exec.Command("python", "detectron/vgw_all_test.py")
  cmd.Stdout = os.Stdout
  cmd.Stderr = os.Stderr
  fmt.Println(cmd.Run())

  fin := Install{Result: "finished"}
  byteArray, err := json.Marshal(fin)
  if err != nil {
    fmt.Println(err)
  }

  fmt.Println(string(byteArray))
  json.NewEncoder(w).Encode(fin)

  return
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

func WriteTest(w http.ResponseWriter, r *http.Request) {
  T := GetTaskImages(w, r, "test")

  dir := "output/" + T.Output
  err := os.Mkdir(dir, 0755 )

  if err != nil {
    fmt.Println(err)
  }

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
  c := GetTaskImages(w, r, "train")

  f, err := os.Create("detectron/vgw_all_train.py")

  if err != nil {
    log.Fatal(err)
  }

  defer f.Close()

  imps := "import os\nfrom detectron2.data.datasets import register_coco_instances\nfrom detectron2.engine        import DefaultTrainer\nfrom detectron2.config         import get_cfg\nfrom detectron2               import model_zoo\n\n"

  reg := `register_coco_instances("vgw_cos_train", {}, "detectron/train/annotations/all_in_one.json", "detectron/train/images/")` + "\n"
  reg += `register_coco_instances("vgw_all_test", {}, "detectron/test/annotations/alltest200/output.json", "detectron/test/images_200/")` + "\n\n"

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

  out := `print(cfg.OUTPUT_DIR)` + "\n"
  out += `os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)` + "\n"
  out += `trainer = DefaultTrainer(cfg)` + "\n"
  out += `trainer.resume_or_load(resume=`+ c.ResumeTrain + `)` + "\n"
  out += `trainer.train()` + "\n"

  imps += reg + cfg + params + out

  _, err2 := f.WriteString(imps)

  if err2 != nil {
    log.Fatal(err2)
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
