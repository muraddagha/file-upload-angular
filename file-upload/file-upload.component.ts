import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ImageCroppedEvent, LoadedImage } from "ngx-image-cropper";
import { map } from "rxjs";
import { CommonApiService } from "../../services/api/common-api.service";
import { CrudApiService } from "../../services/api/crud-api.service";
import { UtilitiesService } from "../../services/utilities.service";

@Component({
  selector: "app-file-upload",
  templateUrl: "./file-upload.component.html",
  styleUrls: ["./file-upload.component.scss"]
})
export class FileUploadComponent implements OnInit {
  @Output() filePathEmitter: EventEmitter<File> = new EventEmitter<File>();
  @Output() removeUploadEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Input() isPerson: boolean = false;
  public filePath: string = null;
  public file: any = null;
  public imageChangedEvent: any = "";
  public croppedImage: any = null;
  public barWidth: string = "0%";
  public progressCount: number = 0;
  constructor(private utilitiesService: UtilitiesService, private commonApiService: CommonApiService, private crudApiService: CrudApiService) {}

  ngOnInit(): void {}

  public fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  public imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.file = this.utilitiesService.base64ToFile(this.croppedImage, this.imageChangedEvent.target.files[0].name);
  }

  public uploadFile(): void {
    let timeElapsed: number = 0;
    let uploadSpeed: number = 0;
    var formData = new FormData();
    formData.append("file", this.file);
    this.commonApiService
      .uploadData(formData)
      .pipe(
        map(event => {
          if (event.type == HttpEventType.UploadProgress) {
            this.barWidth = Math.round((100 / (event.total || 0)) * event.loaded) + "%";
            let startedDate = new Date().getTime().toFixed();
            timeElapsed = parseInt(startedDate) - 0;
            uploadSpeed = event.total / (timeElapsed / 1000);
            let prgoress = setInterval(() => {
              if (this.progressCount == 100) {
                clearInterval(prgoress);
              } else {
                this.progressCount += 1;
              }
            }, uploadSpeed);
          } else if (event.type == HttpEventType.Response) {
            this.filePathEmitter.emit(event.body["src"]);
            this.filePath = event.body["src"];
          }
        })
      )
      .subscribe({
        next: res => {},
        error: () => {},
        complete: () => {}
      });
  }
  public remove(): void {
    this.removeUploadEmitter.emit(this.filePath);
    this.file = null;
    this.croppedImage = null;
    this.imageChangedEvent = "";
    this.filePath = null;
    this.progressCount = 0;
  }
}
