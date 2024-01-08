import {
  } from "../bin/cli/actions/init";
  import * as path from "path";
import { detectFrontendFramework } from "../bin/cli/utils/helper";

  
  describe("detect framework", () => {

  
    test("Detect NextJs framework", async () => {

      const nextJsFolderPath = path.join(__dirname, "./cloudfront-hosting-toolkit/nextjs");
      const framework = await detectFrontendFramework(nextJsFolderPath);
      console.log(framework);
      expect(framework).toEqual("nextjs")
    });

    test("Detect VueJs framework", async () => {

      const nextJsFolderPath = path.join(__dirname, "./cloudfront-hosting-toolkit/vuejs");
      const framework = await detectFrontendFramework(nextJsFolderPath);
      console.log(framework);
      expect(framework).toEqual("vuejs")
    });

    test("Detect ReactJS legacy framework", async () => {

      const nextJsFolderPath = path.join(__dirname, "./cloudfront-hosting-toolkit/reactjs");
      const framework = await detectFrontendFramework(nextJsFolderPath);
      console.log(framework);
      expect(framework).toEqual("reactjs")
    });

    test("Detect AngularJS framework", async () => {

      const nextJsFolderPath = path.join(__dirname, "./cloudfront-hosting-toolkit/angularjs");
      const framework = await detectFrontendFramework(nextJsFolderPath);
      console.log(framework);
      expect(framework).toEqual("angularjs")
    });

    test("Detect No framework", async () => {

      const nextJsFolderPath = path.join(__dirname, "./cloudfront-hosting-toolkit/no_framework");
      const framework = await detectFrontendFramework(nextJsFolderPath);
      console.log(framework);
      expect(framework).toEqual("basic")
    });

    test("Empty folder", async () => {

      const nextJsFolderPath = path.join(__dirname, "./cloudfront-hosting-toolkit/empty_folder");
      const framework = await detectFrontendFramework(nextJsFolderPath);
      console.log(framework);
      expect(framework).toEqual("")
    });
  
    

  });
  