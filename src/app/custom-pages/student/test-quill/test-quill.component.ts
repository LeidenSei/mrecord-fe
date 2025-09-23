import {Component, VERSION, ViewChild} from '@angular/core';
import "quill-mention";
import {QuillEditorComponent} from "ngx-quill";

@Component({
  selector: 'app-test-quill',
  templateUrl: './test-quill.component.html',
  styleUrls: ['./test-quill.component.scss']
})
export class TestQuillComponent {
  name = "Angular " + VERSION.major;
  @ViewChild(QuillEditorComponent, {static: true})
  editor: QuillEditorComponent;

  obj = {
    ops: [
      {insert: "3+"},
      {
        insert: {
          mention: {
            denotationChar: "",
            id: "1",
            value: "hahahaha",
            index: 1
          }
        }
      },
      {insert: "54"}
    ]
  };

  modules = {
    toolbar: false,
    mention: {
      mentionListClass: "ql-mention-list mat-elevation-z8",
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      showDenotationChar: false,
      spaceAfterInsert: false,
      onSelect: (item, insertItem) => {
        const editor = this.editor.quillEditor;
        insertItem(item);
        // necessary because quill-mention triggers changes as 'api' instead of 'user'
        editor.insertText(editor.getLength() - 1, "", "user");
      },
      source: (searchTerm, renderList) => {
        const values = [
          {id: 1, value: "Fredrik Sundqvist", age: 5},
          {id: 2, value: "Patrik Sjölin", age: 20}
        ];

        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = [];

          values.forEach(entry => {
            if (
              entry.value.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
            ) {
              matches.push(entry);
            }
          });
          renderList(matches, searchTerm);
        }
      }
    }
  };

  content = "";

  constructor() {
    setTimeout(() => {
      this.editor.quillEditor.setContents(this.obj);
    }, 0);
  }

  private _replaceRange(s: string, r: string, start: number, end: number) {
    return s.substring(0, start) + r + s.substring(end + 1);
  }

  _test(evt) {
    console.log({evt});
  }

  getText() {
    console.log(this.editor.quillEditor.getContents());
    const {ops} = this.editor.quillEditor.getContents();
    const result = ops.reduce((acc, {insert}) => {
      if (typeof insert === "string") {
        acc += insert;
      } else {
        acc += insert.mention.value;
      }

      return acc;
    }, "");

    console.log({result});
  }
}
